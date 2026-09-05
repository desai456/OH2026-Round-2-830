from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import uuid
import datetime
import io

try:
    from backend.database import get_db
    from backend.models import Quotation, QuoteItem, ApprovalRecord, AuditLog
    from backend.schemas import QuoteCreateInput, QuoteResponse, CartPreviewInput, PipelineStageUpdateInput
    from backend.services.governance import calculate_blended_risk_ml as calculate_blended_risk
    from backend.services.pricing import PricingEngine
    from backend.services.intelligence import RecommendationEngine, get_upsell_suggestions
    from backend.services.reporting import ReportingEngine
except ImportError:
    from database import get_db
    from models import Quotation, QuoteItem, ApprovalRecord, AuditLog
    from schemas import QuoteCreateInput, QuoteResponse, CartPreviewInput, PipelineStageUpdateInput
    from services.governance import calculate_blended_risk_ml as calculate_blended_risk
    from services.pricing import PricingEngine
    from services.intelligence import RecommendationEngine, get_upsell_suggestions
    from services.reporting import ReportingEngine

router = APIRouter(prefix="/quotations", tags=["Quotations & Cart Engine"])

@router.get("/")
def list_quotations(status: str = None, db: Session = Depends(get_db)):
    query = db.query(Quotation)
    if status:
        query = query.filter(Quotation.status == status)
    quotes = query.order_by(Quotation.created_at.desc()).all()

    result = []
    for q in quotes:
        result.append({
            "id": q.id,
            "quote_number": q.quote_number,
            "customer_name": q.customer_name,
            "customer_tier": q.customer_tier,
            "rep_name": q.rep_name,
            "status": q.status,
            "stage": q.status,
            "blended_risk_score": float(q.blended_risk_score or 0.0),
            "approval_required": q.approval_required,
            "subtotal": float(q.subtotal or 0.0),
            "total_discount": float(q.total_discount or 0.0),
            "grand_total": float(q.grand_total or 0.0),
            "margin_percent": float(q.margin_percent or 0.0),
            "created_at": q.created_at.isoformat() if q.created_at else None,
            "updated_at": q.updated_at.isoformat() if q.updated_at else None
        })
    return result

@router.post("/live-cart-preview")
def live_cart_preview(payload: CartPreviewInput, db: Session = Depends(get_db)):
    """
    POST /api/quotations/live-cart-preview
    Stateless endpoint accepting cart items and computing exact totals and blended margins
    using Python Decimal financial precision.
    """
    engine = PricingEngine(db)
    items_raw = [item.dict() for item in payload.items]
    return engine.calculate_cart_totals(items_raw)

@router.post("/recommendations")
def get_cart_recommendations(payload: dict, db: Session = Depends(get_db)):
    """
    POST /api/quotations/recommendations
    Returns ranked upsell/cross-sell suggestions with live blended margin delta computation.
    """
    cart_items = payload.get("items", [])
    engine = RecommendationEngine(db)
    suggestions = engine.get_ranked_suggestions(cart_items)
    return {"recommendations": suggestions}

@router.get("/{quote_id}")
def get_quotation(quote_id: str, db: Session = Depends(get_db)):
    quote = db.query(Quotation).filter(Quotation.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quotation not found")

    items = db.query(QuoteItem).filter(QuoteItem.quotation_id == quote_id).all()
    approvals = db.query(ApprovalRecord).filter(ApprovalRecord.quotation_id == quote_id).all()

    return {
        "id": quote.id,
        "quote_number": quote.quote_number,
        "customer_name": quote.customer_name,
        "customer_tier": quote.customer_tier,
        "rep_name": quote.rep_name,
        "status": quote.status,
        "stage": quote.status,
        "blended_risk_score": float(quote.blended_risk_score or 0.0),
        "approval_required": quote.approval_required,
        "subtotal": float(quote.subtotal or 0.0),
        "total_discount": float(quote.total_discount or 0.0),
        "grand_total": float(quote.grand_total or 0.0),
        "margin_percent": float(quote.margin_percent or 0.0),
        "notes": quote.notes,
        "created_at": quote.created_at.isoformat() if quote.created_at else None,
        "updated_at": quote.updated_at.isoformat() if quote.updated_at else None,
        "items": [
            {
                "id": i.id,
                "product_id": i.product_id,
                "product_name": i.product_name,
                "category": i.category,
                "quantity": i.quantity,
                "unit_price": float(i.unit_price),
                "cost_price": float(i.cost_price),
                "discount_percent": float(i.discount_percent),
                "line_total": float(i.line_total),
                "line_margin": float(i.line_margin),
                "is_recurring": i.is_recurring,
                "billing_cycle": i.billing_cycle
            }
            for i in items
        ],
        "approvals": [
            {
                "id": a.id,
                "step": a.step,
                "status": a.status,
                "approver_name": a.approver_name,
                "comments": a.comments
            }
            for a in approvals
        ]
    }

@router.patch("/{quote_id}/cart")
def update_quotation_cart(quote_id: str, payload: CartPreviewInput, db: Session = Depends(get_db)):
    """
    PATCH /api/quotations/{id}/cart
    Saves current cart state to DB, overwriting QuoteItem records and updating parent Quotation.
    """
    quote = db.query(Quotation).filter(Quotation.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quotation not found")

    pricing_engine = PricingEngine(db)
    items_raw = [item.dict() for item in payload.items]
    totals = pricing_engine.calculate_cart_totals(items_raw)

    # Clear existing items and replace
    db.query(QuoteItem).filter(QuoteItem.quotation_id == quote_id).delete()

    for line in totals["lines"]:
        db.add(QuoteItem(
            id=f"qi-{uuid.uuid4().hex[:6]}",
            quotation_id=quote_id,
            product_id=line["product_id"],
            product_name=line["product_name"],
            category="Hardware",
            quantity=line["quantity"],
            unit_price=line["unit_price"],
            cost_price=line["cost_price"],
            discount_percent=line["discount_pct"],
            line_total=line["line_total"],
            line_margin=line["line_margin_pct"]
        ))

    quote.subtotal = totals["subtotal"]
    quote.total_discount = totals["total_discount"]
    quote.grand_total = totals["total_selling_price"]
    quote.total_cost = totals["total_cost"]
    quote.margin_percent = totals["blended_margin_pct"]
    quote.updated_at = datetime.datetime.utcnow()

    db.commit()
    db.refresh(quote)

    return {"message": "Cart state updated successfully", "grand_total": float(quote.grand_total), "blended_margin_pct": float(quote.margin_percent)}

@router.patch("/{quote_id}/stage")
def update_quotation_stage(quote_id: str, payload: PipelineStageUpdateInput, db: Session = Depends(get_db)):
    """
    PATCH /api/quotations/{id}/stage
    Updates stage column for Kanban pipeline drag & drop and logs to AuditLog.
    """
    quote = db.query(Quotation).filter(Quotation.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quotation not found")

    previous_stage = quote.status or "DRAFT"
    new_stage = payload.new_stage

    quote.status = new_stage
    quote.updated_at = datetime.datetime.utcnow()

    db.add(AuditLog(
        id=f"log-{uuid.uuid4().hex[:6]}",
        quotation_id=quote.id,
        user_id="Sales Rep",
        action="STAGE_CHANGE",
        previous_stage=previous_stage,
        new_stage=new_stage,
        rationale_note=f"Kanban drag and drop stage transition to {new_stage}.",
        entity_type="Quotation",
        entity_id=quote.id,
        performed_by=quote.rep_name or "Sales Rep",
        details=f"Moved quotation {quote.quote_number} from {previous_stage} to {new_stage}."
    ))

    db.commit()
    return {"message": f"Stage updated to {new_stage}", "previous_stage": previous_stage, "new_stage": new_stage}

@router.get("/{quote_id}/pdf")
def get_quotation_pdf(quote_id: str, db: Session = Depends(get_db)):
    """
    GET /api/quotations/{id}/pdf
    Generates and returns formatted PDF file stream.
    """
    reporting_engine = ReportingEngine(db)
    pdf_bytes = reporting_engine.generate_quotation_pdf(quote_id)

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=Quotation_{quote_id}.pdf"}
    )
