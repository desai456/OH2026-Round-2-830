from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List

try:
    from backend.database import get_db
    from backend.services.negotiation import NegotiationEngine
    from backend.schemas import CustomerQuotationResponse, CounterOfferPayload
except ImportError:
    from database import get_db
    from services.negotiation import NegotiationEngine
    from schemas import CustomerQuotationResponse, CounterOfferPayload

router = APIRouter(prefix="/portal", tags=["Customer Portal Negotiation"])

@router.post("/generate-link/{quote_id}")
def generate_portal_magic_link(quote_id: str, db: Session = Depends(get_db)):
    engine = NegotiationEngine(db)
    token = engine.generate_magic_link(quote_id)
    return {
        "quotation_id": quote_id,
        "token": token,
        "magic_link": f"/customer/portal?token={token}"
    }

@router.get("/quote/{token}")
def get_restricted_customer_quote(token: str, db: Session = Depends(get_db)):
    """
    GET /api/portal/quote/{token}
    Strictly validates portal token and returns a customer-restricted payload
    PHYSICALLY OMITTING margin_percent, cost_price, internal_notes, and risk_score.
    """
    engine = NegotiationEngine(db)
    return engine.get_restricted_quotation(token)

@router.post("/quote/{token}/comment")
def add_portal_line_comment(token: str, payload: dict, db: Session = Depends(get_db)):
    engine = NegotiationEngine(db)
    p_token = engine.validate_token(token)

    author_name = payload.get("author_name", "Customer")
    comment_text = payload.get("comment") or payload.get("comment_text") or "Submitted comment"
    line_id = payload.get("line_id") or payload.get("quotation_line_id")

    try:
        from backend.models import LineComment
    except ImportError:
        from models import LineComment

    import uuid, datetime
    comment_entry = LineComment(
        id=f"lc-{uuid.uuid4().hex[:6]}",
        quotation_id=p_token.quotation_id,
        quotation_line_id=line_id,
        author_type="CUSTOMER",
        author_name=author_name,
        comment_text=comment_text,
        timestamp=datetime.datetime.utcnow()
    )
    db.add(comment_entry)
    db.commit()

    return {"message": "Comment recorded successfully", "id": comment_entry.id}

@router.post("/quote/{token}/counter")
def submit_portal_counter_offer(token: str, payload: CounterOfferPayload, db: Session = Depends(get_db)):
    """
    POST /api/portal/quote/{token}/counter
    Submits customer counter offer, recalculates terms, runs DiscountRiskEngine,
    and automatically re-routes to PENDING_MANAGER_APPROVAL if thresholds are breached.
    """
    engine = NegotiationEngine(db)
    return engine.process_counter_offer(token, payload.dict())

@router.post("/quote/{token}/accept")
def accept_portal_quotation(token: str, db: Session = Depends(get_db)):
    """
    POST /api/portal/quote/{token}/accept
    One-click customer acceptance confirming the current quotation.
    """
    engine = NegotiationEngine(db)
    return engine.accept_quotation(token)
