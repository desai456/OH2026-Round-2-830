"""
DealFlow360 - Discount Anomaly Detection
Shared feature engineering for the Isolation Forest / LOF models.

IMPORTANT: training (train_anomaly_model.py) and inference (services/ml_anomaly.py)
both import from this file, so the feature vector layout can never drift between
the model that was trained and the model that is being scored.
"""
import math

# Keep in sync with services/governance.py DEFAULT_TIER_LIMITS.
# Duplicated on purpose (no import cycle) - if you change discount ceilings in
# governance.py, mirror the change here and retrain.
TIER_LIMITS = {
    "Bronze":   {"Hardware": 5.0,  "Services": 3.0,  "Subscriptions": 5.0},
    "Silver":   {"Hardware": 10.0, "Services": 5.0,  "Subscriptions": 10.0},
    "Gold":     {"Hardware": 15.0, "Services": 10.0, "Subscriptions": 15.0},
    "Platinum": {"Hardware": 20.0, "Services": 15.0, "Subscriptions": 20.0},
}

TIER_ORDER = {"Bronze": 0, "Silver": 1, "Gold": 2, "Platinum": 3}
CATEGORIES = ["Hardware", "Services", "Subscriptions"]

# Order matters - this is the exact column order the models are trained on.
FEATURE_NAMES = [
    "discount_percent",
    "quantity_log",
    "unit_price_log",
    "line_value_log",
    "line_margin_percent",
    "tier_rank",
    "discount_to_limit_ratio",
    "cat_hardware",
    "cat_services",
    "cat_subscriptions",
]


def _category_one_hot(category: str):
    return [
        1.0 if category == "Hardware" else 0.0,
        1.0 if category == "Services" else 0.0,
        1.0 if category == "Subscriptions" else 0.0,
    ]


def build_feature_vector(item: dict, customer_tier: str) -> list:
    """Turn one quote line item + the quote's customer tier into a numeric feature vector."""
    category = item.get("category", "Hardware")
    if category not in CATEGORIES:
        category = "Hardware"

    discount = float(item.get("discount_percent", 0.0) or 0.0)
    quantity = max(1, int(item.get("quantity", 1) or 1))
    unit_price = max(0.0, float(item.get("unit_price", 0.0) or 0.0))
    cost_price = float(item.get("cost_price", unit_price) or unit_price)

    tier_limits = TIER_LIMITS.get(customer_tier, TIER_LIMITS["Gold"])
    allowed_limit = tier_limits.get(category, 10.0)

    line_value = quantity * unit_price
    discounted_unit_price = unit_price * (1 - discount / 100.0)
    line_margin_percent = (
        ((discounted_unit_price - cost_price) / discounted_unit_price) * 100.0
        if discounted_unit_price > 0 else 0.0
    )
    discount_to_limit_ratio = discount / allowed_limit if allowed_limit > 0 else discount

    return [
        discount,
        math.log1p(quantity),
        math.log1p(unit_price),
        math.log1p(max(line_value, 0.0)),
        line_margin_percent,
        float(TIER_ORDER.get(customer_tier, 2)),
        discount_to_limit_ratio,
        *_category_one_hot(category),
    ]


def build_feature_matrix(items: list, customer_tier: str) -> list:
    return [build_feature_vector(it, customer_tier) for it in items]
