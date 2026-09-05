from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid
import datetime

try:
    from backend.database import get_db
    from backend.models import ApprovalRecord, Quotation, AuditLog
    from backend.schemas import ApprovalActionInput
except ImportError:
    from database import get_db
    from models import ApprovalRecord, Quotation, AuditLog
    from schemas import ApprovalActionInput

router = APIRouter(prefix="/approvals", tags=["Approval Routing"])

@router.get("/")
def list_approvals(db: Session = Depends(get_db)):
    records = db.query(ApprovalRecord).all()
    results = []
    for r in records:
        quote = db.query(Quotation).filter(Quotation.id == r.quotation_id).first()
        results.append({
            "id": r.id,
            "quotation_id": r.quotation_id,
            "quote_number": quote.quote_number if quote else "N/A",
            "customer_name": quote.customer_name if quote else "N/A",
            "step": r.step,
            "status": r.status,
            "approver_name": r.approver_name,
            "comments": r.comments,
            "created_at": r.created_at.isoformat() if r.created_at else None
        })
    return results

@router.post("/act")
def act_on_approval(payload: ApprovalActionInput, db: Session = Depends(get_db)):
    record = db.query(ApprovalRecord).filter(
        ApprovalRecord.quotation_id == payload.quotation_id,
        ApprovalRecord.step == payload.step
    ).first()
    
    if not record:
        raise HTTPException(status_code=404, detail="Approval record not found for given step")
        
    record.status = payload.status
    record.approver_name = payload.approver_name
    record.comments = payload.comments
    
    quote = db.query(Quotation).filter(Quotation.id == payload.quotation_id).first()
    
    if payload.status == "Rejected":
        if quote:
            quote.status = "Rejected"
    elif payload.status == "Approved":
        # Check if all steps for this quote are approved
        all_records = db.query(ApprovalRecord).filter(ApprovalRecord.quotation_id == payload.quotation_id).all()
        if all(r.status == "Approved" for r in all_records):
            if quote:
                quote.status = "Approved"
                
    # Log Audit
    db.add(AuditLog(
        id=f"log-{uuid.uuid4().hex[:6]}",
        entity_type="Approval",
        entity_id=payload.quotation_id,
        action=f"{payload.step} {payload.status}",
        performed_by=payload.approver_name,
        details=payload.comments or f"{payload.step} set status to {payload.status}"
    ))
    
    db.commit()
    return {"message": f"Approval step '{payload.step}' updated to {payload.status}."}
