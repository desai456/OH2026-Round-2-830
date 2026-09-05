from decimal import Decimal, ROUND_HALF_UP
from typing import List, Dict, Any
from sqlalchemy.orm import Session

try:
    from backend.models import Product
except ImportError:
    from models import Product

class PricingEngine:
    def __init__(self, db: Session):
        self.db = db

    def calculate_cart_totals(self, items_payload: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Financial Precision Cart Calculation Engine using Python Decimal.
        Calculates line-level selling prices, margins, overall cart totals,
        and blended cart margin percentage.
        """
        lines_output = []
        total_subtotal_dec = Decimal("0.00")
        total_discount_dollars_dec = Decimal("0.00")
        total_selling_price_dec = Decimal("0.00")
        total_cost_dec = Decimal("0.00")

        for item in items_payload:
            pid = item.get("product_id")
            qty = Decimal(str(item.get("quantity", 1)))
            disc_pct = Decimal(str(item.get("discount_pct", 0.0)))

            product = self.db.query(Product).filter(Product.id == pid).first()
            if product:
                list_price_dec = Decimal(str(product.unit_price or 0.0))
                cost_price_dec = Decimal(str(product.cost_price or 0.0))
                product_name = product.name
            else:
                list_price_dec = Decimal(str(item.get("unit_price", 100.0)))
                cost_price_dec = Decimal(str(item.get("cost_price", 60.0)))
                product_name = item.get("product_name", f"Product {pid}")

            # Selling Price per unit after discount
            disc_multiplier = Decimal("1.00") - (disc_pct / Decimal("100.00"))
            unit_selling_price_dec = (list_price_dec * disc_multiplier).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

            # Totals for line
            line_subtotal_dec = (list_price_dec * qty).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            line_selling_price_total_dec = (unit_selling_price_dec * qty).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            line_disc_dollars_dec = line_subtotal_dec - line_selling_price_total_dec
            line_cost_total_dec = (cost_price_dec * qty).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

            # Line Margin %
            if line_selling_price_total_dec > Decimal("0.00"):
                line_margin_pct_dec = (((line_selling_price_total_dec - line_cost_total_dec) / line_selling_price_total_dec) * Decimal("100.00")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            else:
                line_margin_pct_dec = Decimal("0.00")

            total_subtotal_dec += line_subtotal_dec
            total_discount_dollars_dec += line_disc_dollars_dec
            total_selling_price_dec += line_selling_price_total_dec
            total_cost_dec += line_cost_total_dec

            category = product.category if (product and product.category) else item.get("category", "Hardware")
            is_recurring = (category == "Subscriptions") or bool(item.get("is_recurring", False))
            billing_cycle = item.get("billing_cycle", "Annual" if is_recurring else None)

            lines_output.append({
                "product_id": pid,
                "product_name": product_name,
                "category": category,
                "quantity": int(qty),
                "unit_price": float(unit_selling_price_dec),
                "list_price": float(list_price_dec),
                "cost_price": float(cost_price_dec),
                "discount_pct": float(disc_pct),
                "selling_price": float(unit_selling_price_dec),
                "line_total": float(line_selling_price_total_dec),
                "line_cost": float(line_cost_total_dec),
                "line_margin_pct": float(line_margin_pct_dec),
                "is_recurring": is_recurring,
                "billing_cycle": billing_cycle
            })


        # Blended Cart Margin % = ((Total Selling Price - Total Cost) / Total Selling Price) * 100
        if total_selling_price_dec > Decimal("0.00"):
            blended_margin_pct_dec = (((total_selling_price_dec - total_cost_dec) / total_selling_price_dec) * Decimal("100.00")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        else:
            blended_margin_pct_dec = Decimal("0.00")

        return {
            "lines": lines_output,
            "subtotal": float(total_subtotal_dec),
            "total_discount": float(total_discount_dollars_dec),
            "total_selling_price": float(total_selling_price_dec),
            "total_cost": float(total_cost_dec),
            "blended_margin_pct": float(blended_margin_pct_dec)
        }
