from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from pydantic import BaseModel
import uuid
import datetime

try:
    from backend.database import get_db
    from backend.models import ApprovalRecord, Quotation, AuditLog
    from backend.schemas import ApprovalActionInput
    from backend.services.governance import DiscountRiskEngine
except ImportError:
    from database import get_db
    from models import ApprovalRecord, Quotation, AuditLog
    from schemas import ApprovalActionInput
    from services.governance import DiscountRiskEngine

router = APIRouter(prefix="/approvals", tags=["Approval Routing"])

class ActionPayload(BaseModel):
    action: str # 'APPROVE' or 'REJECT'
    rationale: str
    user_id: Optional[str] = "usr-manager"
    user_role: Optional[str] = "Sales Manager"
    approver_name: Optional[str] = None
    step: Optional[str] = None

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

@router.post("/{approval_id}/action")
@router.post("/act")
def process_approval_action(
    approval_id: Optional[str] = None,
    payload: ActionPayload = Body(...),
    db: Session = Depends(get_db)
):
    """
    POST /api/approvals/{id}/action or /api/approvals/act
    Accepts: { "action": "APPROVE" | "REJECT", "rationale": "string", "user_id": "string", "user_role": "string", "step": "string" }
    Enforces role-based access (Manager vs. Finance), updates quotation stage,
    triggers escalation to Finance if required, and writes an immutable entry to AuditLog.
    """
    # 1. Locate approval record by ID or quotation_id + step
    record = None
    if approval_id:
        record = db.query(ApprovalRecord).filter(ApprovalRecord.id == approval_id).first()
        if not record:
            record = db.query(ApprovalRecord).filter(
                ApprovalRecord.quotation_id == approval_id,
                ApprovalRecord.status == "Pending"
            ).first()

    if not record and payload.step:
        record = db.query(ApprovalRecord).filter(
            ApprovalRecord.step == payload.step,
            ApprovalRecord.status == "Pending"
        ).first()

    if not record:
        # Fall back to any pending record
        record = db.query(ApprovalRecord).filter(ApprovalRecord.status == "Pending").first()

    if not record:
        raise HTTPException(status_code=404, detail="No pending approval record found for given ID/step")

    quotation = db.query(Quotation).filter(Quotation.id == record.quotation_id).first()
    if not quotation:
        raise HTTPException(status_code=404, detail="Associated quotation not found")

    user_role = payload.user_role or "Sales Manager"
    approver_name = payload.approver_name or payload.user_id or "Approver"
    action_upper = payload.action.upper()
    rationale_text = payload.rationale or payload.comments or "No rationale provided."

    # 2. Enforce Role-Based Access Control (RBAC)
    if record.step == "Sales Manager" and user_role not in ["Sales Manager", "Admin", "VP of Sales"]:
        raise HTTPException(
            status_code=403,
            detail=f"Role '{user_role}' is not authorized to approve Sales Manager governance step."
        )
    elif record.step == "Finance" and user_role not in ["Finance", "Admin", "CFO"]:
        raise HTTPException(
            status_code=403,
            detail=f"Role '{user_role}' is not authorized to approve Finance governance step."
        )

    previous_stage = quotation.status

    # 3. Handle REJECT Action
    if action_upper in ["REJECT", "REJECTED"]:
        record.status = "Rejected"
        record.approver_name = approver_name
        record.comments = rationale_text
        quotation.status = "REJECTED"
        new_stage = "REJECTED"

    # 4. Handle APPROVE Action
    elif action_upper in ["APPROVE", "APPROVED"]:
        record.status = "Approved"
        record.approver_name = approver_name
        record.comments = rationale_text

        # Check if Finance escalation is needed
        if record.step == "Sales Manager" and (quotation.escalate_to_finance or float(quotation.blended_risk_score or 0) > 5.0):
            # Check if Finance record already exists
            finance_record = db.query(ApprovalRecord).filter(
                ApprovalRecord.quotation_id == quotation.id,
                ApprovalRecord.step == "Finance"
            ).first()
            if not finance_record:
                finance_record = ApprovalRecord(
                    id=f"app-{uuid.uuid4().hex[:6]}",
                    quotation_id=quotation.id,
                    step="Finance",
                    status="Pending"
                )
                db.add(finance_record)
            quotation.status = "PENDING_FINANCE_APPROVAL"
            new_stage = "PENDING_FINANCE_APPROVAL"
        else:
            # Check if all approval steps are complete
            all_records = db.query(ApprovalRecord).filter(ApprovalRecord.quotation_id == quotation.id).all()
            if all(r.status == "Approved" for r in all_records):
                quotation.status = "FULFILLMENT"
                new_stage = "FULFILLMENT"
            else:
                new_stage = quotation.status
    else:
        raise HTTPException(status_code=400, detail=f"Invalid action '{payload.action}'. Must be APPROVE or REJECT.")

    # 5. Write Immutable AuditLog
    now_dt = datetime.datetime.utcnow()
    audit_entry = AuditLog(
        id=f"log-{uuid.uuid4().hex[:6]}",
        quotation_id=quotation.id,
        user_id=payload.user_id or approver_name,
        action=action_upper,
        previous_stage=previous_stage,
        new_stage=new_stage,
        rationale_note=rationale_text,
        entity_type="Quotation",
        entity_id=quotation.id,
        performed_by=approver_name,
        details=f"Step '{record.step}' set to {record.status}. Rationale: {rationale_text}",
        created_at=now_dt,
        timestamp=now_dt
    )
    db.add(audit_entry)

    db.commit()
    db.refresh(quotation)

    return {
        "message": f"Action '{action_upper}' processed successfully for step '{record.step}'.",
        "quotation_id": quotation.id,
        "previous_stage": previous_stage,
        "new_stage": new_stage,
        "step_status": record.status,
        "blended_risk_score": float(quotation.blended_risk_score or 0.0)
    }

