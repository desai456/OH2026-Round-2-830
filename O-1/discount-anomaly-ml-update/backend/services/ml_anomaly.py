"""
DealFlow360 - Discount Anomaly Detection (Isolation Forest + Local Outlier Factor)

This is the ML inference layer. It:
  1. Lazy-loads trained model artifacts (auto-trains once on first use if missing,
     so the feature works out-of-the-box with zero manual setup).
  2. Scores each quote line item and returns a 0-100 "ml_anomaly_score" per line
     plus a quote-level blended ML score.
  3. Is combined with the existing rule-based governance score in governance.py's
     calculate_blended_risk_ml() - that's the function the rest of the app calls.

This file intentionally never raises out to the caller: if models can't be
loaded/trained for any reason, it degrades to a neutral (0) ML score so the
rule-based approval routing in governance.py keeps working either way.
"""
import os
import json
import threading

import numpy as np
import joblib

try:
    from backend.ml.features import build_feature_vector, FEATURE_NAMES
except ImportError:
    from ml.features import build_feature_vector, FEATURE_NAMES

ARTIFACT_DIR = os.path.join(os.path.dirname(__file__), "..", "ml", "artifacts")
SCALER_PATH = os.path.join(ARTIFACT_DIR, "scaler.joblib")
IFOREST_PATH = os.path.join(ARTIFACT_DIR, "isolation_forest.joblib")
LOF_PATH = os.path.join(ARTIFACT_DIR, "lof.joblib")
META_PATH = os.path.join(ARTIFACT_DIR, "meta.json")

_lock = threading.Lock()
_scaler = None
_iforest = None
_lof = None
_meta = None
_load_failed = False


def _artifacts_present() -> bool:
    return os.path.exists(SCALER_PATH) and os.path.exists(IFOREST_PATH) and os.path.exists(LOF_PATH)


def _train_now():
    try:
        from backend.ml.train_anomaly_model import train_and_save
    except ImportError:
        from ml.train_anomaly_model import train_and_save
    return train_and_save()


def ensure_model_ready() -> dict:
    """Loads models into memory, training them first if no artifacts exist yet.
    Safe to call multiple times (e.g. once on app startup) and from multiple threads."""
    global _scaler, _iforest, _lof, _meta, _load_failed

    with _lock:
        if _iforest is not None and _lof is not None and _scaler is not None:
            return _meta or {}

        try:
            if not _artifacts_present():
                _train_now()
            _scaler = joblib.load(SCALER_PATH)
            _iforest = joblib.load(IFOREST_PATH)
            _lof = joblib.load(LOF_PATH)
            if os.path.exists(META_PATH):
                with open(META_PATH) as f:
                    _meta = json.load(f)
            else:
                _meta = {}
            _load_failed = False
        except Exception as exc:  # pragma: no cover - defensive
            print(f"[ml] discount anomaly model unavailable, falling back to rule-only scoring: {exc}")
            _load_failed = True
            _meta = {}

    return _meta or {}


def retrain() -> dict:
    """Forces a fresh training run (e.g. call periodically once real quote history builds up)."""
    global _scaler, _iforest, _lof, _meta
    with _lock:
        meta = _train_now()
        _scaler = joblib.load(SCALER_PATH)
        _iforest = joblib.load(IFOREST_PATH)
        _lof = joblib.load(LOF_PATH)
        _meta = meta
    return meta


def is_ready() -> bool:
    return _iforest is not None and _lof is not None and not _load_failed


def get_model_info() -> dict:
    ensure_model_ready()
    return {
        "ready": is_ready(),
        "artifact_dir": os.path.abspath(ARTIFACT_DIR),
        **(_meta or {}),
    }


def _rescale(raw_score: float, p01: float, p99: float) -> float:
    """Higher raw model score = more normal. Rescale so output is 0-100 where
    100 = maximally anomalous, using the training set's 1st/99th percentile as bounds."""
    if p99 <= p01:
        return 0.0
    pct = (p99 - raw_score) / (p99 - p01)
    return float(np.clip(pct * 100.0, 0.0, 100.0))


def score_items(items: list, customer_tier: str = "Gold") -> dict:
    """Scores every line item of a quote. Returns per-line ml_anomaly_score (0-100)
    plus quote-level max/average, degrading gracefully to zeros if the model isn't available."""
    ensure_model_ready()

    if not items:
        return {"ml_anomaly_score": 0.0, "ml_avg_score": 0.0, "line_scores": [], "model_ready": is_ready()}

    if not is_ready():
        return {
            "ml_anomaly_score": 0.0,
            "ml_avg_score": 0.0,
            "line_scores": [0.0 for _ in items],
            "model_ready": False,
        }

    p01_if, p99_if = _meta.get("if_score_p01", -1.0), _meta.get("if_score_p99", 1.0)
    p01_lof, p99_lof = _meta.get("lof_score_p01", -1.0), _meta.get("lof_score_p99", 1.0)

    vectors = np.array([build_feature_vector(it, customer_tier) for it in items], dtype=float)
    vectors_scaled = _scaler.transform(vectors)

    if_raw = _iforest.decision_function(vectors_scaled)
    lof_raw = _lof.decision_function(vectors_scaled)

    line_scores = []
    for i in range(len(items)):
        if_pct = _rescale(float(if_raw[i]), p01_if, p99_if)
        lof_pct = _rescale(float(lof_raw[i]), p01_lof, p99_lof)
        blended = round((if_pct + lof_pct) / 2.0, 1)
        line_scores.append(blended)

    return {
        "ml_anomaly_score": float(max(line_scores)),          # quote-level = worst offending line
        "ml_avg_score": float(round(sum(line_scores) / len(line_scores), 1)),
        "line_scores": line_scores,
        "model_ready": True,
        "model_version": _meta.get("model_version"),
    }
