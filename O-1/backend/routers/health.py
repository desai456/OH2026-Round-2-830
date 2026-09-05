from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

try:
    from backend.database import get_db
    from backend.services.health import DealHealthEngine
    from backend.schemas import NudgeInput
except ImportError:
    from database import get_db
    from services.health import DealHealthEngine
    from schemas import NudgeInput

router = APIRouter(prefix="/health", tags=["Deal Health & Anomaly Alerts"])

@router.get("/alerts")
def get_deal_health_alerts(db: Session = Depends(get_db)):
    """
    GET /api/health/alerts
    Executes DealHealthEngine checks to detect stalled deals and rep discount outliers.
    """
    engine = DealHealthEngine(db)
    return engine.get_dashboard_alerts()

@router.get("/")
def list_deal_health_alerts(db: Session = Depends(get_db)):
    engine = DealHealthEngine(db)
    return engine.get_dashboard_alerts()

@router.post("/nudge/{quotation_id}")
def trigger_nudge_alert(quotation_id: str, payload: Optional[NudgeInput] = None, db: Session = Depends(get_db)):
    """
    POST /api/health/nudge/{quotation_id}
    Triggers automated reminder nudge or manager escalation ping.
    """
    action_type = payload.action_type if payload else "CUSTOMER_REMINDER"
    engine = DealHealthEngine(db)
    return engine.trigger_nudge(quotation_id, action_type)
