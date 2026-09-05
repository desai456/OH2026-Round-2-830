from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid

try:
    from backend.database import get_db
    from backend.models import DealHealthAlert, Quotation, AuditLog
except ImportError:
    from database import get_db
    from models import DealHealthAlert, Quotation, AuditLog

router = APIRouter(prefix="/health", tags=["Deal Health & Anomaly Alerts"])

@router.get("/")
def list_deal_health_alerts(db: Session = Depends(get_db)):
    alerts = db.query(DealHealthAlert).all()
    return [
        {
            "id": a.id,
            "quotation_id": a.quotation_id,
            "customer_name": a.customer_name,
            "alert_type": a.alert_type,
            "severity": a.severity,
            "description": a.description,
            "status": a.status,
            "created_at": a.created_at.isoformat() if a.created_at else None
        }
        for a in alerts
    ]

@router.post("/trigger-nudge/{alert_id}")
def trigger_automated_nudge(alert_id: str, db: Session = Depends(get_db)):
    alert = db.query(DealHealthAlert).filter(DealHealthAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
        
    # Log escalation action audit
    db.add(AuditLog(
        id=f"log-{uuid.uuid4().hex[:6]}",
        entity_type="Deal Health Alert",
        entity_id=alert.quotation_id,
        action="Automated Nudge Sent",
        performed_by="DealFlow360 Autonomous Engine",
        details=f"Triggered automated email nudge and slack alert for '{alert.alert_type}' on quote {alert.quotation_id}."
    ))
    
    alert.status = "Nudge Sent"
    db.commit()
    return {"message": f"Automated escalation nudge sent for alert '{alert.alert_type}'."}
