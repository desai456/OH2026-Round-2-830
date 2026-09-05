from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

try:
    from backend.database import get_db
    from backend.models import SubscriptionPlan, Quotation, QuoteItem, Invoice
    from backend.services.billing import generate_hybrid_billing_schedule, calculate_proration
except ImportError:
    from database import get_db
    from models import SubscriptionPlan, Quotation, QuoteItem, Invoice
    from services.billing import generate_hybrid_billing_schedule, calculate_proration

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions & Billing"])

@router.get("/")
def list_subscriptions(db: Session = Depends(get_db)):
    plans = db.query(SubscriptionPlan).all()
    return [
        {
            "id": p.id,
            "product_id": p.product_id,
            "plan_name": p.plan_name,
            "billing_cycle": p.billing_cycle,
            "mrr_amount": float(p.mrr_amount),
            "arr_amount": float(p.arr_amount),
            "proration_policy": p.proration_policy
        }
        for p in plans
    ]

@router.get("/hybrid-schedule/{quote_id}")
def get_hybrid_billing_schedule(quote_id: str, db: Session = Depends(get_db)):
    items = db.query(QuoteItem).filter(QuoteItem.quotation_id == quote_id).all()
    quote_items = [
        {
            "product_id": i.product_id,
            "product_name": i.product_name,
            "category": i.category,
            "line_total": float(i.line_total),
            "is_recurring": i.is_recurring,
            "billing_cycle": i.billing_cycle or "Monthly"
        }
        for i in items
    ]
    return generate_hybrid_billing_schedule(quote_items)

@router.post("/proration-check")
def proration_check(current_mrr: float, new_mrr: float, days_remaining: int = 15):
    return calculate_proration(current_mrr, new_mrr, days_remaining)
