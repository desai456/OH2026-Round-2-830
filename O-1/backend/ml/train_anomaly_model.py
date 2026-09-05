"""
DealFlow360 - Discount Anomaly Detection
Trains an Isolation Forest and a Local Outlier Factor model on historical
quote-line-item discounting behaviour and saves them under ml/artifacts/.

Why two models blended together ("blended risk score"):
- Isolation Forest is fast and handles the full feature space (categories,
  tiers, price/quantity scale) well, catching "globally weird" line items.
- Local Outlier Factor (novelty=True) is density-based and is better at
  catching "locally weird" items - e.g. a discount that looks fine overall
  but is way out of line with similar-sized deals in the same category/tier.
Averaging their normalized outputs is what produces the blended ML score.

Data strategy:
- If the live database already has enough real quote history (>= MIN_REAL_ROWS),
  real rows are used (oversampled) as the backbone of the training set.
- Real data is always topped up with rule-consistent synthetic data so the
  model has enough coverage of the full tier x category x discount space,
  and so this works out-of-the-box on a fresh install with almost no history.

Run manually:
    python -m backend.ml.train_anomaly_model
    (or, from inside backend/):  python ml/train_anomaly_model.py

Also called automatically the first time the anomaly service is used and no
saved model is found yet (see services/ml_anomaly.py -> ensure_model_ready()).
"""
import os
import json
import random
import datetime

import numpy as np
import joblib
from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor
from sklearn.preprocessing import StandardScaler

try:
    from backend.ml.features import build_feature_matrix, FEATURE_NAMES, TIER_LIMITS, CATEGORIES
except ImportError:
    from ml.features import build_feature_matrix, FEATURE_NAMES, TIER_LIMITS, CATEGORIES

ARTIFACT_DIR = os.path.join(os.path.dirname(__file__), "artifacts")
SCALER_PATH = os.path.join(ARTIFACT_DIR, "scaler.joblib")
IFOREST_PATH = os.path.join(ARTIFACT_DIR, "isolation_forest.joblib")
LOF_PATH = os.path.join(ARTIFACT_DIR, "lof.joblib")
META_PATH = os.path.join(ARTIFACT_DIR, "meta.json")

MIN_REAL_ROWS = 300          # below this we lean on synthetic bootstrap data
SYNTHETIC_ROWS = 4000
CONTAMINATION = 0.05         # assumed ~5% of historical lines were genuine margin-leak anomalies
RANDOM_STATE = 42

# Realistic-ish unit price ranges per category, used only for synthetic bootstrap data.
PRICE_RANGES = {
    "Hardware": (400.0, 16000.0),
    "Services": (200.0, 6500.0),
    "Subscriptions": (50.0, 5200.0),
}
TIER_WEIGHTS = {"Bronze": 0.15, "Silver": 0.30, "Gold": 0.40, "Platinum": 0.15}
CATEGORY_WEIGHTS = {"Hardware": 0.45, "Services": 0.30, "Subscriptions": 0.25}


def _weighted_choice(weights: dict, rng: random.Random):
    keys = list(weights.keys())
    probs = list(weights.values())
    return rng.choices(keys, weights=probs, k=1)[0]


def _generate_synthetic_rows(n_rows: int, seed: int = RANDOM_STATE):
    """Generates rule-consistent synthetic history: mostly compliant discounting,
    a small contamination fraction of clear margin-leak anomalies."""
    rng = random.Random(seed)
    rows = []
    for _ in range(n_rows):
        tier = _weighted_choice(TIER_WEIGHTS, rng)
        category = _weighted_choice(CATEGORY_WEIGHTS, rng)
        lo, hi = PRICE_RANGES[category]
        unit_price = round(rng.uniform(lo, hi), 2)
        cost_price = round(unit_price * rng.uniform(0.55, 0.85), 2)
        # most line items are small-to-mid quantity, long tail up to 50
        quantity = int(round(rng.triangular(1, 8, 50)))

        allowed_limit = TIER_LIMITS[tier][category]
        is_anomaly = rng.random() < CONTAMINATION
        if is_anomaly:
            # genuine margin-leak: meaningfully over the tier/category ceiling
            discount = round(allowed_limit + rng.uniform(6.0, 28.0), 2)
        else:
            # normal legitimate discounting: usually well under the ceiling,
            # occasionally right up against it
            discount = round(allowed_limit * rng.triangular(0.0, 0.45, 0.98), 2)
        discount = max(0.0, min(discount, 60.0))

        rows.append({
            "category": category,
            "customer_tier": tier,
            "quantity": quantity,
            "unit_price": unit_price,
            "cost_price": cost_price,
            "discount_percent": discount,
        })
    return rows


def _load_real_rows_from_db():
    """Pulls historical quote_items joined with their quotation's customer_tier.
    Returns [] if the DB isn't reachable or has too little history - callers must
    handle that gracefully (this is a bootstrap system, not a hard dependency)."""
    try:
        try:
            from backend.database import SessionLocal
            from backend.models import QuoteItem, Quotation
        except ImportError:
            from database import SessionLocal
            from models import QuoteItem, Quotation

        db = SessionLocal()
        try:
            records = (
                db.query(
                    QuoteItem.category,
                    QuoteItem.quantity,
                    QuoteItem.unit_price,
                    QuoteItem.cost_price,
                    QuoteItem.discount_percent,
                    Quotation.customer_tier,
                )
                .join(Quotation, QuoteItem.quotation_id == Quotation.id)
                .all()
            )
        finally:
            db.close()

        rows = []
        for cat, qty, price, cost, disc, tier in records:
            if cat not in CATEGORIES:
                continue
            rows.append({
                "category": cat,
                "customer_tier": tier or "Gold",
                "quantity": int(qty or 1),
                "unit_price": float(price or 0.0),
                "cost_price": float(cost or 0.0),
                "discount_percent": float(disc or 0.0),
            })
        return rows
    except Exception as exc:  # pragma: no cover - defensive: never break training
        print(f"[ml] could not load real quote history from DB ({exc}); using synthetic data only.")
        return []


def _build_training_matrix(rows):
    items = [
        {
            "category": r["category"],
            "quantity": r["quantity"],
            "unit_price": r["unit_price"],
            "cost_price": r["cost_price"],
            "discount_percent": r["discount_percent"],
        }
        for r in rows
    ]
    tiers = [r["customer_tier"] for r in rows]
    matrix = [build_feature_matrix([it], tier)[0] for it, tier in zip(items, tiers)]
    return np.array(matrix, dtype=float)


def train_and_save(verbose: bool = True) -> dict:
    """Trains IsolationForest + LOF and writes artifacts to ml/artifacts/. Returns metadata dict."""
    os.makedirs(ARTIFACT_DIR, exist_ok=True)

    real_rows = _load_real_rows_from_db()
    source = "real+synthetic"
    if len(real_rows) >= MIN_REAL_ROWS:
        # enough real history: oversample it a bit and top up with a smaller
        # synthetic slice so rare tier/category combos still get coverage
        rows = real_rows * 3 + _generate_synthetic_rows(max(500, len(real_rows)))
        source = "real-weighted"
    else:
        rows = real_rows + _generate_synthetic_rows(SYNTHETIC_ROWS)
        if not real_rows:
            source = "synthetic-bootstrap"

    X = _build_training_matrix(rows)

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    iforest = IsolationForest(
        n_estimators=200,
        contamination=CONTAMINATION,
        random_state=RANDOM_STATE,
    )
    iforest.fit(X_scaled)
    if_train_scores = iforest.decision_function(X_scaled)  # higher = more normal

    lof = LocalOutlierFactor(
        n_neighbors=20,
        contamination=CONTAMINATION,
        novelty=True,  # lets us call .decision_function() later on new/unseen quotes
    )
    lof.fit(X_scaled)
    lof_train_scores = lof.decision_function(X_scaled)  # higher = more normal

    meta = {
        "trained_at": datetime.datetime.utcnow().isoformat() + "Z",
        "n_training_rows": int(len(rows)),
        "n_real_rows_used": int(len(real_rows)),
        "data_source": source,
        "contamination": CONTAMINATION,
        "feature_names": FEATURE_NAMES,
        # robust bounds (1st/99th percentile) used to rescale raw model output to a 0-100 scale
        "if_score_p01": float(np.percentile(if_train_scores, 1)),
        "if_score_p99": float(np.percentile(if_train_scores, 99)),
        "lof_score_p01": float(np.percentile(lof_train_scores, 1)),
        "lof_score_p99": float(np.percentile(lof_train_scores, 99)),
        "model_version": "discount-anomaly-v1",
    }

    joblib.dump(scaler, SCALER_PATH)
    joblib.dump(iforest, IFOREST_PATH)
    joblib.dump(lof, LOF_PATH)
    with open(META_PATH, "w") as f:
        json.dump(meta, f, indent=2)

    if verbose:
        print(f"[ml] trained discount anomaly models on {meta['n_training_rows']} rows "
              f"(source={source}, real_rows={meta['n_real_rows_used']}). Saved to {ARTIFACT_DIR}")

    return meta


if __name__ == "__main__":
    train_and_save()
