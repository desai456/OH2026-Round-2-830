from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
import datetime

try:
    from backend.database import get_db
    from backend.models import Quotation, QuoteItem, ApprovalRecord, AuditLog
    from backend.schemas import QuoteCreateInput, QuoteResponse
    # calculate_blended_risk_ml() = original rule engine blended with the
    # Isolation Forest / LOF discount anomaly models (see services/governance.py)
    from backend.services.governance import calculate_blended_risk_ml as calculate_blended_risk
    from backend.services.intelligence import get_upsell_suggestions
except ImportError:
    from database import get_db
    from models import Quotation, QuoteItem, ApprovalRecord, AuditLog
    from schemas import QuoteCreateInput, QuoteResponse
    from services.governance import calculate_blended_risk_ml as calculate_blended_risk
    from services.intelligence import get_upsell_suggestions

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
            "blended_risk_score": q.blended_risk_score,
            "approval_required": q.approval_required,
            "subtotal": float(q.subtotal or 0.0),
            "total_discount": float(q.total_discount or 0.0),
            "grand_total": float(q.grand_total or 0.0),
            "margin_percent": float(q.margin_percent or 0.0),
            "created_at": q.created_at.isoformat() if q.created_at else None
        })
    return result

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
        "blended_risk_score": quote.blended_risk_score,
        "approval_required": quote.approval_required,
        "subtotal": float(quote.subtotal),
        "total_discount": float(quote.total_discount),
        "grand_total": float(quote.grand_total),
        "margin_percent": float(quote.margin_percent),
        "notes": quote.notes,
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

@router.post("/", response_model=QuoteResponse)
def create_quotation(payload: QuoteCreateInput, db: Session = Depends(get_db)):
    quote_id = f"q-{uuid.uuid4().hex[:6]}"
    quote_number = f"QT-2026-{uuid.uuid4().hex[:4].upper()}"
    
    raw_items = [item.dict() for item in payload.items]
    
    # Calculate Blended Risk Score & Governance Routing
    risk_analysis = calculate_blended_risk(raw_items, payload.customer_tier)
    blended_risk_score = risk_analysis["blended_risk_score"]
    approval_required = risk_analysis["approval_required"]
    
    # Calculate totals and overall margin
    subtotal = 0.0
    total_discount = 0.0
    total_cost = 0.0
    
    item_objects = []
    for item in payload.items:
        line_subtotal = item.quantity * item.unit_price
        line_disc_dollars = line_subtotal * (item.discount_percent / 100.0)
        line_total = line_subtotal - line_disc_dollars
        line_cost = item.quantity * item.cost_price
        line_margin = ((line_total - line_cost) / line_total) * 100.0 if line_total > 0 else 0.0
        
        subtotal += line_subtotal
        total_discount += line_disc_dollars
        total_cost += line_cost
        
        item_objects.append(QuoteItem(
            id=f"qi-{uuid.uuid4().hex[:6]}",
            quotation_id=quote_id,
            product_id=item.product_id,
            product_name=item.product_name,
            category=item.category,
            quantity=item.quantity,
            unit_price=item.unit_price,
            cost_price=item.cost_price,
            discount_percent=item.discount_percent,
            line_total=line_total,
            line_margin=line_margin,
            is_recurring=item.is_recurring,
            billing_cycle=item.billing_cycle
        ))
        
    grand_total = subtotal - total_discount
    overall_margin = ((grand_total - total_cost) / grand_total) * 100.0 if grand_total > 0 else 0.0
    
    status = "Pending Approval" if approval_required != "None" else "Approved"
    
    quotation = Quotation(
        id=quote_id,
        quote_number=quote_number,
        customer_name=payload.customer_name,
        customer_tier=payload.customer_tier,
        rep_name=payload.rep_name,
        status=status,
        blended_risk_score=blended_risk_score,
        approval_required=approval_required,
        subtotal=subtotal,
        total_discount=total_discount,
        grand_total=grand_total,
        total_cost=total_cost,
        margin_percent=overall_margin,
        notes=payload.notes
    )
    
    db.add(quotation)
    for io in item_objects:
        db.add(io)
        
    # Auto-generate Approval steps if required
    if approval_required == "Sales Manager":
        db.add(ApprovalRecord(id=f"app-{uuid.uuid4().hex[:6]}", quotation_id=quote_id, step="Sales Manager", status="Pending"))
    elif approval_required == "Sales Manager & Finance":
        db.add(ApprovalRecord(id=f"app-{uuid.uuid4().hex[:6]}", quotation_id=quote_id, step="Sales Manager", status="Pending"))
        db.add(ApprovalRecord(id=f"app-{uuid.uuid4().hex[:6]}", quotation_id=quote_id, step="Finance", status="Pending"))
        
    # Log audit entry
    db.add(AuditLog(
        id=f"log-{uuid.uuid4().hex[:6]}",
        entity_type="Quotation",
        entity_id=quote_id,
        action="Created Quotation",
        performed_by=payload.rep_name,
        details=(
            f"Quote {quote_number} created. Blended Risk Score: {blended_risk_score} "
            f"(rule={risk_analysis.get('rule_risk_score', blended_risk_score)}, "
            f"ml_anomaly={risk_analysis.get('ml_anomaly_score', 0.0)}). "
            f"Approval Required: {approval_required}."
        )
    ))
    
    db.commit()
    db.refresh(quotation)
    
    return QuoteResponse(
        id=quotation.id,
        quote_number=quotation.quote_number,
        customer_name=quotation.customer_name,
        customer_tier=quotation.customer_tier,
        rep_name=quotation.rep_name,
        status=quotation.status,
        blended_risk_score=quotation.blended_risk_score,
        approval_required=quotation.approval_required,
        subtotal=float(quotation.subtotal),
        total_discount=float(quotation.total_discount),
        grand_total=float(quotation.grand_total),
        margin_percent=float(quotation.margin_percent),
        notes=quotation.notes,
        items=payload.items
    )

@router.post("/{quote_id}/upsell-recommendations")
def get_quote_upsell(quote_id: str, db: Session = Depends(get_db)):
    quote = db.query(Quotation).filter(Quotation.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quotation not found")
        
    items = db.query(QuoteItem).filter(QuoteItem.quotation_id == quote_id).all()
    p_ids = [i.product_id for i in items if i.product_id]
    
    suggestions = get_upsell_suggestions(p_ids, float(quote.margin_percent or 40.0))
    return {"quotation_id": quote_id, "recommendations": suggestions}
