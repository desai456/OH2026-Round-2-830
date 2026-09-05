from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from pydantic import BaseModel
import datetime

try:
    from backend.database import get_db
    from backend.models import SubscriptionPlan, Quotation, QuoteItem, Invoice, OrderLine, Order
    from backend.services.billing import generate_hybrid_billing_schedule, calculate_proration, BillingEngine
except ImportError:
    from database import get_db
    from models import SubscriptionPlan, Quotation, QuoteItem, Invoice, OrderLine, Order
    from services.billing import generate_hybrid_billing_schedule, calculate_proration, BillingEngine

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions & Billing"])


class ModifySubscriptionPayload(BaseModel):
    new_quantity: int
    new_tier_id: Optional[str] = None
    new_tier_price: Optional[float] = None
    change_date: Optional[str] = None


class CancelSubscriptionPayload(BaseModel):
    cancel_date: Optional[str] = None
    reason: Optional[str] = "Customer Requested Cancellation"


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


@router.post("/{line_id}/modify")
def modify_subscription(
    line_id: str,
    payload: ModifySubscriptionPayload = Body(...),
    db: Session = Depends(get_db)
):
    """
    POST /api/subscriptions/{line_id}/modify
    Accepts: { "new_quantity": int, "new_tier_id": str, "new_tier_price": float }
    Triggers calculate_proration logic, generates PRORATED invoice or CreditNote,
    and updates BillingSchedule.
    """
    engine = BillingEngine(db)

    # Resolve line or quote item
    line = db.query(OrderLine).filter(OrderLine.id == line_id).first()
    if not line:
        # Check QuoteItem
        qi = db.query(QuoteItem).filter(QuoteItem.id == line_id).first()
        if not qi:
            raise HTTPException(status_code=404, detail=f"Subscription line {line_id} not found")

        # Resolve or create OrderLine wrapper for this QuoteItem
        order = db.query(Order).filter(Order.quotation_id == qi.quotation_id).first()
        if not order:
            quote = db.query(Quotation).filter(Quotation.id == qi.quotation_id).first()
            engine.generate_initial_invoice(quote.id, db)
            line = db.query(OrderLine).filter(OrderLine.product_id == qi.product_id).first()
        else:
            line = db.query(OrderLine).filter(OrderLine.order_id == order.id, OrderLine.product_id == qi.product_id).first()

    if not line:
        raise HTTPException(status_code=404, detail="Active OrderLine not found for given subscription")

    new_price = payload.new_tier_price if payload.new_tier_price is not None else float(line.unit_price)

    change_dt = None
    if payload.change_date:
        try:
            change_dt = datetime.datetime.strptime(payload.change_date, "%Y-%m-%d").date()
        except ValueError:
            pass

    try:
        proration_res = engine.calculate_proration(
            order_line_id=line.id,
            new_quantity=payload.new_quantity,
            new_tier_price=new_price,
            change_date=change_dt,
            db=db
        )
        return proration_res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Modification failed: {str(e)}")


@router.post("/{line_id}/preview-proration")
def preview_proration(
    line_id: str,
    payload: ModifySubscriptionPayload = Body(...),
    db: Session = Depends(get_db)
):
    """
    POST /api/subscriptions/{line_id}/preview-proration
    Called dynamically by the UI modal as the user adjusts quantity/tier,
    returning live calculation of Prorated Amount Due or Credit to be applied.
    """
    line = db.query(OrderLine).filter(OrderLine.id == line_id).first()
    if not line:
        qi = db.query(QuoteItem).filter(QuoteItem.id == line_id).first()
        if qi:
            old_price = float(qi.unit_price)
            old_qty = qi.quantity
            new_price = payload.new_tier_price if payload.new_tier_price is not None else old_price
            new_qty = payload.new_quantity

            old_mrr = old_price * old_qty
            new_mrr = new_price * new_qty

            res = calculate_proration(old_mrr, new_mrr, days_remaining_in_cycle=15)
            return {
                "line_id": line_id,
                "days_remaining": 15,
                "old_mrr": old_mrr,
                "new_mrr": new_mrr,
                "financial_delta": res["prorated_amount"],
                "credit_or_debit": res["credit_or_debit"],
                "description": res["description"]
            }
        raise HTTPException(status_code=404, detail="Subscription line not found")

    old_price = float(line.unit_price)
    old_qty = line.quantity
    new_price = payload.new_tier_price if payload.new_tier_price is not None else old_price
    new_qty = payload.new_quantity

    today_dt = datetime.date.today()
    c_start = line.cycle_start_date or (today_dt - datetime.timedelta(days=15))
    c_end = line.cycle_end_date or (today_dt + datetime.timedelta(days=15))

    total_days = max(1, (c_end - c_start).days)
    days_remaining = max(0, (c_end - today_dt).days)

    old_daily = (old_price * old_qty * (1 - float(line.applied_discount_pct or 0) / 100.0)) / total_days
    new_daily = (new_price * new_qty * (1 - float(line.applied_discount_pct or 0) / 100.0)) / total_days

    delta = round((new_daily - old_daily) * days_remaining, 2)

    return {
        "line_id": line_id,
        "days_remaining": days_remaining,
        "total_cycle_days": total_days,
        "old_cycle_total": round(old_daily * total_days, 2),
        "new_cycle_total": round(new_daily * total_days, 2),
        "financial_delta": delta,
        "credit_or_debit": "Debit (Invoice Owed)" if delta >= 0 else "Credit Note Owed",
        "description": f"Prorated adjustment for {days_remaining} remaining days in cycle."
    }


@router.post("/{line_id}/cancel")
def cancel_subscription(
    line_id: str,
    payload: CancelSubscriptionPayload = Body(...),
    db: Session = Depends(get_db)
):
    """
    POST /api/subscriptions/{line_id}/cancel
    Triggers cancellation logic, calculates unused cycle credit,
    issues a CreditNote, and cancels future BillingSchedules.
    """
    engine = BillingEngine(db)

    line = db.query(OrderLine).filter(OrderLine.id == line_id).first()
    if not line:
        qi = db.query(QuoteItem).filter(QuoteItem.id == line_id).first()
        if qi:
            order = db.query(Order).filter(Order.quotation_id == qi.quotation_id).first()
            if not order:
                quote = db.query(Quotation).filter(Quotation.id == qi.quotation_id).first()
                engine.generate_initial_invoice(quote.id, db)
                line = db.query(OrderLine).filter(OrderLine.product_id == qi.product_id).first()
            else:
                line = db.query(OrderLine).filter(OrderLine.order_id == order.id, OrderLine.product_id == qi.product_id).first()

    if not line:
        raise HTTPException(status_code=404, detail="Active OrderLine not found for cancellation")

    cancel_dt = None
    if payload.cancel_date:
        try:
            cancel_dt = datetime.datetime.strptime(payload.cancel_date, "%Y-%m-%d").date()
        except ValueError:
            pass

    try:
        result = engine.process_cancellation(
            order_line_id=line.id,
            cancel_date=cancel_dt,
            reason=payload.reason or "Customer Requested Cancellation",
            db=db
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cancellation failed: {str(e)}")

