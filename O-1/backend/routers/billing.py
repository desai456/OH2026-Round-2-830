from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from pydantic import BaseModel
import datetime

try:
    from backend.database import get_db
    from backend.models import Order, OrderLine, Invoice, BillingSchedule, CreditNote, Quotation, QuoteItem
    from backend.services.billing import BillingEngine
except ImportError:
    from database import get_db
    from models import Order, OrderLine, Invoice, BillingSchedule, CreditNote, Quotation, QuoteItem
    from services.billing import BillingEngine

router = APIRouter(prefix="/billing", tags=["Subscriptions & Billing"])


@router.get("/{order_id}")
def get_order_billing_history(order_id: str, db: Session = Depends(get_db)):
    """
    GET /api/billing/{order_id}
    Returns dual-nature invoice history, one-time charges, recurring subscriptions,
    and future billing schedules for an Order or Quotation.
    """
    engine = BillingEngine(db)

    # 1. Try fetching Order
    order = db.query(Order).filter(Order.id == order_id).first()
    quote = None
    if not order:
        quote = db.query(Quotation).filter(Quotation.id == order_id).first()

    if not order and not quote:
        raise HTTPException(status_code=404, detail=f"Order or Quotation {order_id} not found")

    invoices = []
    schedules = []
    credit_notes = []
    one_time_lines = []
    recurring_lines = []

    if order:
        inv_records = db.query(Invoice).filter(Invoice.order_id == order.id).all()
        sched_records = db.query(BillingSchedule).filter(BillingSchedule.order_id == order.id).all()
        cn_records = db.query(CreditNote).filter(CreditNote.order_id == order.id).all()
        line_records = db.query(OrderLine).filter(OrderLine.order_id == order.id).all()

        invoices = [
            {
                "id": inv.id,
                "invoice_number": inv.invoice_number,
                "type": inv.type or "INITIAL",
                "billing_type": inv.billing_type,
                "total_amount": float(inv.amount),
                "due_date": inv.due_date.isoformat() if inv.due_date else None,
                "status": inv.status,
                "created_at": inv.created_at.isoformat() if inv.created_at else None
            }
            for inv in inv_records
        ]

        schedules = [
            {
                "id": s.id,
                "order_line_id": s.order_line_id,
                "next_billing_date": s.next_billing_date.isoformat() if s.next_billing_date else None,
                "amount_due": float(s.amount_due),
                "status": s.status
            }
            for s in sched_records
        ]

        credit_notes = [
            {
                "id": cn.id,
                "order_line_id": cn.order_line_id,
                "amount": float(cn.amount),
                "reason": cn.reason,
                "created_at": cn.created_at.isoformat() if cn.created_at else None
            }
            for cn in cn_records
        ]

        for l in line_records:
            item_dict = {
                "id": l.id,
                "product_id": l.product_id,
                "product_name": l.product_name,
                "line_type": l.line_type,
                "unit_price": float(l.unit_price),
                "quantity": l.quantity,
                "applied_discount_pct": float(l.applied_discount_pct or 0.0),
                "billing_cycle": l.billing_cycle,
                "status": l.status
            }
            if l.line_type == "RECURRING":
                recurring_lines.append(item_dict)
            else:
                one_time_lines.append(item_dict)

    elif quote:
        items = db.query(QuoteItem).filter(QuoteItem.quotation_id == quote.id).all()
        for i in items:
            is_rec = i.is_recurring or (i.category == "Subscriptions")
            item_dict = {
                "id": i.id,
                "product_id": i.product_id,
                "product_name": i.product_name,
                "line_type": "RECURRING" if is_rec else "ONE_TIME",
                "unit_price": float(i.unit_price),
                "quantity": i.quantity,
                "applied_discount_pct": float(i.discount_percent or 0.0),
                "billing_cycle": i.billing_cycle or "MONTHLY",
                "status": "ACTIVE"
            }
            if is_rec:
                recurring_lines.append(item_dict)
            else:
                one_time_lines.append(item_dict)

    return {
        "order_id": order_id,
        "customer_name": order.customer_name if order else quote.customer_name,
        "one_time_charges": one_time_lines,
        "recurring_subscriptions": recurring_lines,
        "invoices": invoices,
        "billing_schedules": schedules,
        "credit_notes": credit_notes
    }
