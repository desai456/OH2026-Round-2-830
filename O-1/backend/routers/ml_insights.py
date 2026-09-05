from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

try:
    from backend.services.governance import calculate_blended_risk_ml
    from backend.services.ml_anomaly import get_model_info, retrain
except ImportError:
    from services.governance import calculate_blended_risk_ml
    from services.ml_anomaly import get_model_info, retrain

router = APIRouter(prefix="/ml/anomaly", tags=["Discount Anomaly Detection (ML)"])


class ScoreItemInput(BaseModel):
    product_name: Optional[str] = None
    category: str
    quantity: int = 1
    unit_price: float
    cost_price: float
    discount_percent: float = 0.0


class ScoreRequest(BaseModel):
    customer_tier: str = "Gold"
    items: List[ScoreItemInput]


@router.get("/status")
def model_status():
    """Model metadata: when it was trained, on how much data, whether it's ready."""
    return get_model_info()


@router.post("/train")
def train_model():
    """Retrains the Isolation Forest / LOF models. Call this periodically once
    real quote history accumulates so the model stops leaning on synthetic data."""
    meta = retrain()
    return {"status": "trained", **meta}


@router.post("/score")
def score_quote(payload: ScoreRequest):
    """Scores a hypothetical (or in-progress) quote without creating it -
    useful for a 'live risk preview' widget in the quote builder UI."""
    raw_items = [item.dict() for item in payload.items]
    result = calculate_blended_risk_ml(raw_items, payload.customer_tier)
    return result
