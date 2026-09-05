"""
DealFlow360 Blended Discount Risk Engine & Multi-Tier Routing Engine

Core Business Logic:
1. DiscountRiskEngine: Calculates line-level margin violation values using DiscountTierRules,
   sums them across quotation lines, and computes the exact Blended Risk Score formula:
   Blended_Risk_Score = (Total Margin Violation Value / Total Quotation Value) * 100
2. Automated Routing Logic:
   - Score <= 0: Route to FULFILLMENT (Auto-Approve)
   - Score > 0 AND Score <= 5.0: Route to PENDING_MANAGER_APPROVAL
   - Score > 5.0: Route to PENDING_MANAGER_APPROVAL with ESCALATE_TO_FINANCE flag enabled
"""

from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session

# Default Fallback Category Ceilings per Customer Tier (%)
DEFAULT_TIER_LIMITS = {
    "Bronze": {"Hardware": 5.0, "Services": 3.0, "Subscriptions": 5.0},
    "Silver": {"Hardware": 10.0, "Services": 5.0, "Subscriptions": 10.0},
    "Gold": {"Hardware": 15.0, "Services": 10.0, "Subscriptions": 15.0},
    "Platinum": {"Hardware": 20.0, "Services": 15.0, "Subscriptions": 20.0},
}

class DiscountRiskEngine:
    """
    Service class responsible for querying customer tier, product category discount rules,
    computing line-item margin violations, calculating overall blended risk score,
    and evaluating automated multi-tier approval routing.
    """

    def __init__(self, db: Optional[Session] = None):
        self.db = db

    def get_max_allowed_discount(
        self, customer_tier: str, category_name: str, product_category_id: Optional[str] = None
    ) -> float:
        """
        Determines the Max_Allowed_Discount percentage by querying DiscountTierRule in database,
        falling back to default tier limits if no specific database rule exists.
        """
        if self.db:
            try:
                try:
                    from backend.models import DiscountTierRule
                except ImportError:
                    from models import DiscountTierRule

                # 1. Query by customer_tier and product_category_id if provided
                if product_category_id:
                    rule = self.db.query(DiscountTierRule).filter(
                        DiscountTierRule.customer_tier == customer_tier,
                        DiscountTierRule.product_category_id == product_category_id
                    ).first()
                    if rule:
                        return float(rule.max_allowed_discount_pct)

                # 2. Query by customer_tier and category_name
                rule = self.db.query(DiscountTierRule).filter(
                    DiscountTierRule.customer_tier == customer_tier,
                    DiscountTierRule.category_name == category_name
                ).first()
                if rule:
                    return float(rule.max_allowed_discount_pct)

            except Exception as e:
                print(f"[DiscountRiskEngine] DB query warning (using defaults): {e}")

        # Fallback to in-memory DEFAULT_TIER_LIMITS dictionary
        tier_rules = DEFAULT_TIER_LIMITS.get(customer_tier, DEFAULT_TIER_LIMITS.get("Gold", {}))
        return float(tier_rules.get(category_name, 10.0))

    def calculate_blended_risk(self, quotation_id: str, db: Optional[Session] = None) -> Dict[str, Any]:
        """
        Meticulously calculates the Blended Risk Score for a given quotation ID:
        
        Algorithm:
        1. Iterate through every QuotationLine / QuoteItem.
        2. For each line, determine specific Max_Allowed_Discount by checking DiscountTierRule
           for customer's tier and product category.
        3. If applied_discount_pct > Max_Allowed_Discount:
           Margin Violation Value = ((applied_discount_pct - Max_Allowed_Discount) / 100) * (unit_price * quantity)
        4. Sum Margin Violation Values across all lines.
        5. Calculate Blended_Risk_Score = (Total Margin Violation Value / Total Quotation Value) * 100.
        """
        active_db = db or self.db
        if not active_db:
            raise ValueError("Database session required for DiscountRiskEngine.calculate_blended_risk")

        try:
            from backend.models import Quotation, QuoteItem, Customer
        except ImportError:
            from models import Quotation, QuoteItem, Customer

        quote = active_db.query(Quotation).filter(Quotation.id == quotation_id).first()
        if not quote:
            raise ValueError(f"Quotation {quotation_id} not found")

        # Resolve customer tier (from quotation or customer record)
        customer_tier = quote.customer_tier or "Gold"
        if quote.customer_id:
            cust = active_db.query(Customer).filter(Customer.id == quote.customer_id).first()
            if cust and cust.tier:
                customer_tier = cust.tier

        total_quotation_value = 0.0
        total_margin_violation_value = 0.0
        line_breakdowns = []

        lines = active_db.query(QuoteItem).filter(QuoteItem.quotation_id == quotation_id).all()

        for line in lines:
            quantity = int(line.quantity or 1)
            unit_price = float(line.unit_price or 0.0)
            applied_discount_pct = float(line.discount_percent or line.applied_discount_pct or 0.0)
            category_name = line.category or "Hardware"
            product_category_id = getattr(line, "product_category_id", None)

            # 1. Gross line subtotal value before discount
            line_gross_value = unit_price * quantity
            total_quotation_value += line_gross_value

            # 2. Get line-specific Max_Allowed_Discount
            max_allowed_discount = self.get_max_allowed_discount(
                customer_tier=customer_tier,
                category_name=category_name,
                product_category_id=product_category_id
            )

            # 3. Calculate Margin Violation Value for line if applied discount exceeds limit
            margin_violation_value = 0.0
            if applied_discount_pct > max_allowed_discount:
                excess_pct = applied_discount_pct - max_allowed_discount
                margin_violation_value = (excess_pct / 100.0) * line_gross_value
                total_margin_violation_value += margin_violation_value

            line_breakdowns.append({
                "product_name": line.product_name,
                "category": category_name,
                "quantity": quantity,
                "unit_price": unit_price,
                "applied_discount_pct": applied_discount_pct,
                "max_allowed_discount": max_allowed_discount,
                "margin_violation_value": round(margin_violation_value, 2),
                "is_violating": applied_discount_pct > max_allowed_discount
            })

        # 4 & 5. Compute overall Blended Risk Score
        if total_quotation_value > 0:
            blended_risk_score = (total_margin_violation_value / total_quotation_value) * 100.0
        else:
            blended_risk_score = 0.0

        blended_risk_score = round(blended_risk_score, 2)
        routing_info = self.evaluate_routing_score(blended_risk_score)

        return {
            "quotation_id": quotation_id,
            "customer_tier": customer_tier,
            "total_quotation_value": round(total_quotation_value, 2),
            "total_margin_violation_value": round(total_margin_violation_value, 2),
            "blended_risk_score": blended_risk_score,
            "predicted_routing": routing_info["stage"],
            "require_finance_escalation": routing_info["require_finance_escalation"],
            "line_breakdowns": line_breakdowns
        }

    def evaluate_routing_score(self, blended_risk_score: float) -> Dict[str, Any]:
        """
        Evaluates automated routing stage based on the Blended Risk Score:
        - Score <= 0: FULFILLMENT (Auto-Approve)
        - Score > 0 AND Score <= 5.0: PENDING_MANAGER_APPROVAL
        - Score > 5.0: PENDING_MANAGER_APPROVAL with ESCALATE_TO_FINANCE flag enabled
        """
        if blended_risk_score <= 0.0:
            return {
                "stage": "FULFILLMENT",
                "require_finance_escalation": False,
                "description": "Auto-approved. Quotation within category ceiling guidelines."
            }
        elif blended_risk_score <= 5.0:
            return {
                "stage": "PENDING_MANAGER_APPROVAL",
                "require_finance_escalation": False,
                "description": "Requires Sales Manager approval."
            }
        else:
            return {
                "stage": "PENDING_MANAGER_APPROVAL",
                "require_finance_escalation": True,
                "description": "Requires Sales Manager approval with required escalation to Finance."
            }

    def evaluate_routing(self, quotation_id: str, db: Optional[Session] = None) -> Dict[str, Any]:
        """
        Evaluates routing stage for a specific quotation in the database.
        """
        risk_data = self.calculate_blended_risk(quotation_id, db)
        return self.evaluate_routing_score(risk_data["blended_risk_score"])


# ---------------------------------------------------------------------------
# Backward Compatibility Helpers
# ---------------------------------------------------------------------------

def calculate_blended_risk(items: Any, customer_tier: str = "Gold", db: Optional[Session] = None) -> dict:
    """
    Unified function supporting both raw line lists (legacy call style) and quotation_id/db calls.
    """
    if isinstance(items, str) and db is not None:
        # Items passed as quotation_id string
        engine = DiscountRiskEngine(db)
        res = engine.calculate_blended_risk(items, db)
        return {
            "blended_risk_score": int(round(res["blended_risk_score"])),
            "raw_blended_score": res["blended_risk_score"],
            "approval_required": "None" if res["predicted_routing"] == "FULFILLMENT" else ("Sales Manager & Finance" if res["require_finance_escalation"] else "Sales Manager"),
            "line_analysis": res["line_breakdowns"],
            "total_margin_violation_value": res["total_margin_violation_value"],
            "total_quotation_value": res["total_quotation_value"]
        }

    # Direct items list processing fallback
    tier_limits = DEFAULT_TIER_LIMITS.get(customer_tier, DEFAULT_TIER_LIMITS["Gold"])
    total_quote_value = 0.0
    total_violation_value = 0.0
    line_analysis = []

    if isinstance(items, list):
        for item in items:
            if isinstance(item, dict):
                category = item.get("category", "Hardware")
                discount = float(item.get("discount_percent", item.get("applied_discount_pct", 0.0)))
                quantity = int(item.get("quantity", 1))
                unit_price = float(item.get("unit_price", 0.0))
                product_name = item.get("product_name", "Product")
            else:
                category = getattr(item, "category", "Hardware")
                discount = float(getattr(item, "discount_percent", getattr(item, "applied_discount_pct", 0.0)))
                quantity = int(getattr(item, "quantity", 1))
                unit_price = float(getattr(item, "unit_price", 0.0))
                product_name = getattr(item, "product_name", "Product")

            max_limit = tier_limits.get(category, 10.0)
            gross_val = unit_price * quantity
            total_quote_value += gross_val

            violation_val = 0.0
            if discount > max_limit:
                violation_val = ((discount - max_limit) / 100.0) * gross_val
                total_violation_value += violation_val

            line_analysis.append({
                "product_name": product_name,
                "category": category,
                "discount_given": discount,
                "allowed_limit": max_limit,
                "excess_points": max(0.0, discount - max_limit),
                "margin_violation_value": round(violation_val, 2)
            })

    score = (total_violation_value / max(total_quote_value, 1.0)) * 100.0
    score = round(score, 2)

    if score <= 0.0:
        approval_required = "None"
    elif score <= 5.0:
        approval_required = "Sales Manager"
    else:
        approval_required = "Sales Manager & Finance"

    return {
        "blended_risk_score": int(round(score)),
        "raw_blended_score": score,
        "approval_required": approval_required,
        "line_analysis": line_analysis
    }


try:
    from backend.services.ml_anomaly import score_items as _ml_score_items
except ImportError:
    try:
        from services.ml_anomaly import score_items as _ml_score_items
    except ImportError:
        _ml_score_items = None


def calculate_blended_risk_ml(items: list, customer_tier: str = "Gold") -> dict:
    rule_result = calculate_blended_risk(items, customer_tier)
    rule_score = rule_result["blended_risk_score"]

    ml_score = 0.0
    ml_result = {}
    if _ml_score_items:
        try:
            ml_result = _ml_score_items(items, customer_tier)
            ml_score = ml_result.get("ml_anomaly_score", 0.0)
        except Exception as e:
            print(f"[calculate_blended_risk_ml] ML score fallback: {e}")

    combined_score = (0.6 * rule_score) + (0.4 * ml_score)
    combined_score = max(combined_score, rule_score)
    blended_risk_score = min(100, int(round(combined_score)))

    if blended_risk_score == 0:
        approval_required = "None"
    elif blended_risk_score <= 50:
        approval_required = "Sales Manager"
    else:
        approval_required = "Sales Manager & Finance"

    return {
        "blended_risk_score": blended_risk_score,
        "rule_risk_score": rule_score,
        "ml_anomaly_score": ml_score,
        "approval_required": approval_required,
        "line_analysis": rule_result.get("line_analysis", [])
    }

