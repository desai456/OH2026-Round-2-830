from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid

try:
    from backend.database import get_db
    from backend.models import CustomerNegotiation, Quotation, QuoteItem, ApprovalRecord, AuditLog
    from backend.schemas import NegotiationInput
    from backend.services.governance import calculate_blended_risk
except ImportError:
    from database import get_db
    from models import CustomerNegotiation, Quotation, QuoteItem, ApprovalRecord, AuditLog
    from schemas import NegotiationInput
    from services.governance import calculate_blended_risk

router = APIRouter(prefix="/portal", tags=["Customer Portal Negotiation"])

@router.get("/quotation/{quote_id}")
def get_customer_portal_quote(quote_id: str, db: Session = Depends(get_db)):
    quote = db.query(Quotation).filter(Quotation.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quotation not found")
        
    items = db.query(QuoteItem).filter(QuoteItem.quotation_id == quote_id).all()
    comments = db.query(CustomerNegotiation).filter(CustomerNegotiation.quotation_id == quote_id).order_by(CustomerNegotiation.created_at.asc()).all()
    
    return {
        "id": quote.id,
        "quote_number": quote.quote_number,
        "customer_name": quote.customer_name,
        "status": quote.status,
        "subtotal": float(quote.subtotal),
        "total_discount": float(quote.total_discount),
        "grand_total": float(quote.grand_total),
        "margin_percent": float(quote.margin_percent),
        "items": [
            {
                "id": i.id,
                "product_name": i.product_name,
                "quantity": i.quantity,
                "unit_price": float(i.unit_price),
                "discount_percent": float(i.discount_percent),
                "line_total": float(i.line_total)
            }
            for i in items
        ],
        "comments": [
            {
                "id": c.id,
                "author_name": c.author_name,
                "author_role": c.author_role,
                "comment": c.comment,
                "proposed_discount": float(c.proposed_discount) if c.proposed_discount else None,
                "created_at": c.created_at.isoformat() if c.created_at else None
            }
            for c in comments
        ]
    }

@router.post("/negotiate")
def submit_customer_counter(payload: NegotiationInput, db: Session = Depends(get_db)):
    quote = db.query(Quotation).filter(Quotation.id == payload.quotation_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quotation not found")
        
    # Record negotiation entry
    neg_id = f"neg-{uuid.uuid4().hex[:6]}"
    comment_entry = CustomerNegotiation(
        id=neg_id,
        quotation_id=payload.quotation_id,
        author_name=payload.author_name,
        author_role=payload.author_role,
        comment=payload.comment,
        proposed_discount=payload.proposed_discount
    )
    db.add(comment_entry)
    
    # If proposed discount exceeds current limits, auto re-trigger approval flow
    if payload.proposed_discount and payload.proposed_discount > 15.0:
        quote.status = "Pending Approval"
        quote.approval_required = "Sales Manager & Finance"
        db.add(ApprovalRecord(id=f"app-{uuid.uuid4().hex[:6]}", quotation_id=payload.quotation_id, step="Sales Manager", status="Pending"))
        db.add(ApprovalRecord(id=f"app-{uuid.uuid4().hex[:6]}", quotation_id=payload.quotation_id, step="Finance", status="Pending"))
        
        db.add(AuditLog(
            id=f"log-{uuid.uuid4().hex[:6]}",
            entity_type="Customer Portal",
            entity_id=payload.quotation_id,
            action="Customer Counter-Offer Submitted",
            performed_by=payload.author_name,
            details=f"Customer proposed {payload.proposed_discount}% discount. Triggered Sales Manager & Finance approval flow."
        ))
    else:
        quote.status = "Under Negotiation"
        db.add(AuditLog(
            id=f"log-{uuid.uuid4().hex[:6]}",
            entity_type="Customer Portal",
            entity_id=payload.quotation_id,
            action="Customer Comment Added",
            performed_by=payload.author_name,
            details=payload.comment
        ))
        
    db.commit()
    return {"message": "Negotiation request submitted successfully.", "status": quote.status}
