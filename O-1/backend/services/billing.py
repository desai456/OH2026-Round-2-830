"""
DealFlow360 Hybrid Billing & Subscription Proration Engine

Features:
1. BillingEngine:
   - Dual-Nature Invoicing (generate_initial_invoice): Combines 100% of ONE_TIME hardware lines
     and the 1st cycle of RECURRING SaaS lines into a single initial invoice, creating
     future BillingSchedule entries (+30/+90/+365 days).
   - Proration Engine (calculate_proration): Uses Python Decimal and datetime modules to calculate
     exact daily rates for mid-cycle quantity/tier adjustments, issuing PRORATED Invoices or CreditNotes.
   - Subscription Cancellation (process_cancellation): Calculates unused daily cycle portion,
     issues CreditNote, and cancels future BillingSchedules.
"""

from typing import Dict, List, Any, Optional
from decimal import Decimal, ROUND_HALF_UP
import datetime
from sqlalchemy.orm import Session
import uuid

class BillingEngine:
    """
    Core engine providing financial-precision Decimal calculations for hybrid invoicing,
    mid-cycle proration, and subscription cancellation credit notes.
    """

    def __init__(self, db: Optional[Session] = None):
        self.db = db

    def _to_decimal(self, val: Any) -> Decimal:
        """Converts float/int/str safely to Decimal with 2-decimal precision."""
        if val is None:
            return Decimal("0.00")
        if isinstance(val, Decimal):
            return val
        return Decimal(str(val)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    def generate_initial_invoice(self, order_id: str, db: Optional[Session] = None) -> Dict[str, Any]:
        """
        Generates initial invoice for an Order or Quotation:
        - Aggregates 100% of ONE_TIME hardware/services lines.
        - Aggregates the FIRST cycle of all RECURRING SaaS lines.
        - Generates BillingSchedule records for recurring lines.
        """
        active_db = db or self.db
        if not active_db:
            raise ValueError("Database session required for generate_initial_invoice")

        try:
            from backend.models import Order, OrderLine, Invoice, BillingSchedule, Quotation, QuoteItem
        except ImportError:
            from models import Order, OrderLine, Invoice, BillingSchedule, Quotation, QuoteItem

        order = active_db.query(Order).filter(Order.id == order_id).first()
        quote = None
        if not order:
            quote = active_db.query(Quotation).filter(Quotation.id == order_id).first()

        today_dt = datetime.date.today()
        one_time_total = Decimal("0.00")
        first_cycle_recurring_total = Decimal("0.00")

        created_schedules = []
        created_lines = []

        if order:
            lines = active_db.query(OrderLine).filter(OrderLine.order_id == order_id).all()
            customer_name = order.customer_name
        elif quote:
            customer_name = quote.customer_name
            items = active_db.query(QuoteItem).filter(QuoteItem.quotation_id == order_id).all()

            # Create Order wrapper if converting from Quote
            order = Order(
                id=f"ord-{uuid.uuid4().hex[:6]}",
                quotation_id=quote.id,
                order_number=f"ORD-2026-{uuid.uuid4().hex[:4].upper()}",
                customer_name=quote.customer_name,
                customer_tier=quote.customer_tier,
                total_amount=self._to_decimal(quote.grand_total),
                status="ACTIVE"
            )
            active_db.add(order)
            active_db.flush()

            lines = []
            for item in items:
                is_rec = item.is_recurring or (item.category == "Subscriptions")
                ol = OrderLine(
                    id=f"ol-{uuid.uuid4().hex[:6]}",
                    order_id=order.id,
                    product_id=item.product_id,
                    product_name=item.product_name,
                    line_type="RECURRING" if is_rec else "ONE_TIME",
                    unit_price=self._to_decimal(item.unit_price),
                    quantity=int(item.quantity or 1),
                    applied_discount_pct=self._to_decimal(item.discount_percent),
                    billing_cycle=(item.billing_cycle or "MONTHLY").upper(),
                    cycle_start_date=today_dt,
                    cycle_end_date=today_dt + datetime.timedelta(days=365 if (item.billing_cycle or "").upper() == "YEARLY" else 30),
                    status="ACTIVE"
                )
                active_db.add(ol)
                lines.append(ol)
            active_db.flush()
        else:
            raise ValueError(f"Order or Quotation {order_id} not found")

        for line in lines:
            line_subtotal = self._to_decimal(line.unit_price) * Decimal(line.quantity)
            disc_amount = line_subtotal * (self._to_decimal(line.applied_discount_pct) / Decimal("100.00"))
            line_net = (line_subtotal - disc_amount).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

            if line.line_type == "ONE_TIME":
                one_time_total += line_net
            else:
                first_cycle_recurring_total += line_net
                cycle_str = (line.billing_cycle or "MONTHLY").upper()
                cycle_days = 365 if cycle_str == "YEARLY" else (90 if cycle_str == "QUARTERLY" else 30)
                next_date = today_dt + datetime.timedelta(days=cycle_days)

                sched = BillingSchedule(
                    id=f"bs-{uuid.uuid4().hex[:6]}",
                    order_id=order.id,
                    order_line_id=line.id,
                    next_billing_date=next_date,
                    amount_due=line_net,
                    status="SCHEDULED"
                )
                active_db.add(sched)
                created_schedules.append(sched)

        initial_invoice_amount = one_time_total + first_cycle_recurring_total
        inv_id = f"inv-{uuid.uuid4().hex[:6]}"
        inv_number = f"INV-2026-{uuid.uuid4().hex[:4].upper()}"

        invoice = Invoice(
            id=inv_id,
            invoice_number=inv_number,
            order_id=order.id,
            quotation_id=order.quotation_id,
            customer_name=customer_name,
            billing_type="Initial Hybrid Invoice",
            type="INITIAL",
            amount=initial_invoice_amount,
            due_date=today_dt + datetime.timedelta(days=14),
            status="Unpaid"
        )
        active_db.add(invoice)
        active_db.commit()

        return {
            "order_id": order.id,
            "invoice_id": inv_id,
            "invoice_number": inv_number,
            "one_time_total": float(one_time_total),
            "first_cycle_recurring_total": float(first_cycle_recurring_total),
            "total_initial_invoice_amount": float(initial_invoice_amount),
            "scheduled_future_cycles": len(created_schedules)
        }

    def calculate_proration(
        self,
        order_line_id: str,
        new_quantity: int,
        new_tier_price: Any,
        change_date: Optional[datetime.date] = None,
        db: Optional[Session] = None
    ) -> Dict[str, Any]:
        """
        Calculates exact financial proration delta using Decimal math & datetime:
        - Determines cycle start and end dates.
        - Calculates daily rates for old vs. new plan.
        - Computes unused portion of old plan and cost of new plan for remaining days.
        - Generates PRORATED Invoice (if delta > 0) or CreditNote (if delta < 0).
        """
        active_db = db or self.db
        if not active_db:
            raise ValueError("Database session required for calculate_proration")

        try:
            from backend.models import OrderLine, Order, Invoice, CreditNote, BillingSchedule
        except ImportError:
            from models import OrderLine, Order, Invoice, CreditNote, BillingSchedule

        line = active_db.query(OrderLine).filter(OrderLine.id == order_line_id).first()
        if not line:
            raise ValueError(f"OrderLine {order_line_id} not found")

        change_dt = change_date or datetime.date.today()
        c_start = line.cycle_start_date or (change_dt - datetime.timedelta(days=15))
        c_end = line.cycle_end_date or (change_dt + datetime.timedelta(days=15))

        total_days = max(1, (c_end - c_start).days)
        days_elapsed = max(0, (change_dt - c_start).days)
        days_remaining = max(0, (c_end - change_dt).days)

        old_qty = Decimal(line.quantity or 1)
        old_unit_price = self._to_decimal(line.unit_price)
        disc_factor = Decimal("1.00") - (self._to_decimal(line.applied_discount_pct) / Decimal("100.00"))

        old_cycle_total = (old_unit_price * old_qty * disc_factor).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        daily_rate_old = old_cycle_total / Decimal(total_days)

        new_qty_dec = Decimal(new_quantity)
        new_unit_price_dec = self._to_decimal(new_tier_price)
        new_cycle_total = (new_unit_price_dec * new_qty_dec * disc_factor).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        daily_rate_new = new_cycle_total / Decimal(total_days)

        cost_old_used = (daily_rate_old * Decimal(days_elapsed)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        cost_new_remaining = (daily_rate_new * Decimal(days_remaining)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        # Financial Delta = cost of new plan for remaining days minus unused portion of old plan
        unused_old_credit = (daily_rate_old * Decimal(days_remaining)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        financial_delta = (cost_new_remaining - unused_old_credit).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        invoice_id = None
        credit_note_id = None
        adjustment_type = "NONE"

        if financial_delta > Decimal("0.00"):
            adjustment_type = "PRORATED_INVOICE"
            inv_obj = Invoice(
                id=f"inv-{uuid.uuid4().hex[:6]}",
                invoice_number=f"INV-PRORATED-{uuid.uuid4().hex[:4].upper()}",
                order_id=line.order_id,
                customer_name=line.order.customer_name if line.order else "Customer",
                billing_type="Mid-Cycle Prorated Charge",
                type="PRORATED",
                amount=financial_delta,
                due_date=change_dt + datetime.timedelta(days=7),
                status="Unpaid"
            )
            active_db.add(inv_obj)
            active_db.flush()
            invoice_id = inv_obj.id

        elif financial_delta < Decimal("0.00"):
            adjustment_type = "CREDIT_NOTE"
            cn_amount = abs(financial_delta)
            cn_obj = CreditNote(
                id=f"cn-{uuid.uuid4().hex[:6]}",
                order_id=line.order_id,
                order_line_id=line.id,
                amount=cn_amount,
                reason=f"Mid-cycle subscription downgrade adjustment for {days_remaining} remaining days."
            )
            active_db.add(cn_obj)
            active_db.flush()
            credit_note_id = cn_obj.id

        # Update OrderLine attributes
        line.quantity = new_quantity
        line.unit_price = new_unit_price_dec
        line.status = "MODIFIED"

        # Update future BillingSchedule amount
        sched = active_db.query(BillingSchedule).filter(
            BillingSchedule.order_line_id == line.id,
            BillingSchedule.status == "SCHEDULED"
        ).first()

        if sched:
            sched.amount_due = new_cycle_total

        active_db.commit()

        return {
            "order_line_id": order_line_id,
            "change_date": change_dt.isoformat(),
            "total_days_in_cycle": total_days,
            "days_elapsed": days_elapsed,
            "days_remaining": days_remaining,
            "old_cycle_total": float(old_cycle_total),
            "new_cycle_total": float(new_cycle_total),
            "daily_rate_old": float(daily_rate_old),
            "daily_rate_new": float(daily_rate_new),
            "financial_delta": float(financial_delta),
            "adjustment_type": adjustment_type,
            "invoice_id": invoice_id,
            "credit_note_id": credit_note_id,
            "description": f"Proration applied for {days_remaining} remaining days in cycle."
        }

    def process_cancellation(
        self,
        order_line_id: str,
        cancel_date: Optional[datetime.date] = None,
        reason: str = "Customer Requested Cancellation",
        db: Optional[Session] = None
    ) -> Dict[str, Any]:
        """
        Calculates unused daily portion of subscription cycle, generates CreditNote,
        and cancels future BillingSchedules.
        """
        active_db = db or self.db
        if not active_db:
            raise ValueError("Database session required for process_cancellation")

        try:
            from backend.models import OrderLine, CreditNote, BillingSchedule
        except ImportError:
            from models import OrderLine, CreditNote, BillingSchedule

        line = active_db.query(OrderLine).filter(OrderLine.id == order_line_id).first()
        if not line:
            raise ValueError(f"OrderLine {order_line_id} not found")

        cancel_dt = cancel_date or datetime.date.today()
        c_start = line.cycle_start_date or (cancel_dt - datetime.timedelta(days=15))
        c_end = line.cycle_end_date or (cancel_dt + datetime.timedelta(days=15))

        total_days = max(1, (c_end - c_start).days)
        unused_days = max(0, (c_end - cancel_dt).days)

        unit_price = self._to_decimal(line.unit_price)
        qty = Decimal(line.quantity or 1)
        disc_factor = Decimal("1.00") - (self._to_decimal(line.applied_discount_pct) / Decimal("100.00"))

        cycle_total = (unit_price * qty * disc_factor).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        daily_rate = cycle_total / Decimal(total_days)

        credit_amount = (daily_rate * Decimal(unused_days)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        cn_id = f"cn-{uuid.uuid4().hex[:6]}"
        cn = CreditNote(
            id=cn_id,
            order_id=line.order_id,
            order_line_id=line.id,
            amount=credit_amount,
            reason=f"Subscription cancellation refund for {unused_days} unused days. Reason: {reason}"
        )
        active_db.add(cn)

        # Cancel future schedules for this line
        schedules = active_db.query(BillingSchedule).filter(
            BillingSchedule.order_line_id == line.id,
            BillingSchedule.status == "SCHEDULED"
        ).all()

        for s in schedules:
            s.status = "CANCELLED"

        line.status = "CANCELLED"
        active_db.commit()

        return {
            "order_line_id": order_line_id,
            "cancel_date": cancel_dt.isoformat(),
            "unused_days": unused_days,
            "total_cycle_days": total_days,
            "credit_note_id": cn_id,
            "credit_amount": float(credit_amount),
            "cancelled_schedules_count": len(schedules),
            "message": f"Subscription cancelled. CreditNote {cn_id} issued for ${float(credit_amount):,.2f}."
        }


# ---------------------------------------------------------------------------
# Backward Compatibility Helpers
# ---------------------------------------------------------------------------

def generate_hybrid_billing_schedule(quote_items: list, start_date: str = None) -> dict:
    if not start_date:
        start_date = datetime.date.today().isoformat()
        
    start_dt = datetime.datetime.strptime(start_date, "%Y-%m-%d").date()
    one_time_lines = []
    recurring_lines = []
    one_time_total = Decimal("0.00")
    total_mrr = Decimal("0.00")
    total_arr = Decimal("0.00")
    
    for item in quote_items:
        is_recurring = item.get("is_recurring", False) or item.get("category") == "Subscriptions"
        line_total = Decimal(str(item.get("line_total", 0.0)))
        
        if is_recurring:
            cycle = item.get("billing_cycle", "Monthly")
            mrr = line_total / Decimal("12.0") if cycle == "Annual" else line_total
            arr = line_total if cycle == "Annual" else line_total * Decimal("12.0")
            total_mrr += mrr
            total_arr += arr
            
            recurring_lines.append({
                "product_id": item.get("product_id"),
                "product_name": item.get("product_name"),
                "billing_cycle": cycle,
                "amount": float(line_total),
                "mrr": float(mrr.quantize(Decimal("0.01"))),
                "arr": float(arr.quantize(Decimal("0.01"))),
                "next_billing_date": (start_dt + datetime.timedelta(days=30 if cycle == "Monthly" else 365)).isoformat()
            })
        else:
            one_time_total += line_total
            one_time_lines.append({
                "product_id": item.get("product_id"),
                "product_name": item.get("product_name"),
                "amount": float(line_total)
            })
            
    schedule = []
    if one_time_total > Decimal("0.00"):
        schedule.append({
            "invoice_number": f"INV-{start_dt.strftime('%Y%m')}-001",
            "type": "One-Time Hardware & Setup",
            "amount": float(one_time_total.quantize(Decimal("0.01"))),
            "due_date": start_dt.isoformat(),
            "status": "Ready for Billing"
        })
        
    if recurring_lines:
        for idx, rec in enumerate(recurring_lines, start=2):
            schedule.append({
                "invoice_number": f"SUB-{start_dt.strftime('%Y%m')}-00{idx}",
                "type": f"Recurring Subscription ({rec['billing_cycle']}) - {rec['product_name']}",
                "amount": float(rec["amount"]),
                "due_date": rec["next_billing_date"],
                "status": "Scheduled"
            })
            
    return {
        "one_time_total": float(one_time_total.quantize(Decimal("0.01"))),
        "total_mrr": float(total_mrr.quantize(Decimal("0.01"))),
        "total_arr": float(total_arr.quantize(Decimal("0.01"))),
        "one_time_lines": one_time_lines,
        "recurring_lines": recurring_lines,
        "billing_schedule": schedule
    }

def calculate_proration(current_mrr: float, new_mrr: float, days_remaining_in_cycle: int = 15, total_days_in_cycle: int = 30) -> dict:
    daily_delta = (Decimal(str(new_mrr)) - Decimal(str(current_mrr))) / Decimal(str(total_days_in_cycle))
    prorated_charge = (daily_delta * Decimal(str(days_remaining_in_cycle))).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    return {
        "prorated_amount": float(prorated_charge),
        "credit_or_debit": "Debit" if prorated_charge >= 0 else "Credit Note",
        "description": f"Mid-cycle adjustment for {days_remaining_in_cycle} remaining days."
    }

