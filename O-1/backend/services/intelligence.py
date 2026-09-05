"""
DealFlow360 Intelligence & Recommendation Engine
Provides live upsell/cross-sell recommendations with exact blended margin delta calculations.
"""

from typing import List, Dict, Any
from sqlalchemy.orm import Session

try:
    from backend.models import Product, ProductPairingRule
    from backend.services.pricing import PricingEngine
except ImportError:
    from models import Product, ProductPairingRule
    from services.pricing import PricingEngine

class RecommendationEngine:
    def __init__(self, db: Session):
        self.db = db

    def get_ranked_suggestions(self, current_cart_payload: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Ranked recommendation algorithm:
        1. Promoted items first.
        2. Higher pairing score second.
        3. Excludes existing cart items.
        4. Calculates exact Blended Margin Delta for each item.
        """
        pricing_engine = PricingEngine(self.db)
        
        # Step A: Current Blended Margin Pct
        current_totals = pricing_engine.calculate_cart_totals(current_cart_payload)
        current_blended_margin = current_totals["blended_margin_pct"]

        cart_product_ids = set(item.get("product_id") for item in current_cart_payload if item.get("product_id"))

        # Query all available candidate products
        all_products = self.db.query(Product).all()
        if not all_products:
            # Fallback demonstration items
            return []

        # Find pairing rules for items currently in cart
        pairing_scores = {}
        rules = self.db.query(ProductPairingRule).filter(ProductPairingRule.primary_product_id.in_(list(cart_product_ids))).all()
        for r in rules:
            pairing_scores[r.recommended_product_id] = max(pairing_scores.get(r.recommended_product_id, 0), r.pairing_score)

        candidate_products = [p for p in all_products if p.id not in cart_product_ids]

        # Rank candidates: Promoted items first, then pairing score (descending), then price
        def rank_key(p: Product):
            is_prom = 1 if getattr(p, 'promoted', False) else 0
            score = pairing_scores.get(p.id, 50)
            return (is_prom, score, float(p.unit_price or 0.0))

        candidate_products.sort(key=rank_key, reverse=True)

        suggestions = []
        for p in candidate_products[:4]:
            # Step B: Simulate adding recommended product (qty 1, disc 0%)
            simulated_cart = list(current_cart_payload) + [
                {
                    "product_id": p.id,
                    "product_name": p.name,
                    "quantity": 1,
                    "discount_pct": 0.0,
                    "unit_price": float(p.unit_price or 0.0),
                    "cost_price": float(p.cost_price or 0.0)
                }
            ]
            simulated_totals = pricing_engine.calculate_cart_totals(simulated_cart)
            simulated_blended_margin = simulated_totals["blended_margin_pct"]

            # Step C: Margin Delta = Simulated - Current
            margin_delta = round(simulated_blended_margin - current_blended_margin, 2)

            suggestions.append({
                "product_id": p.id,
                "product_name": p.name,
                "category": p.category,
                "unit_price": float(p.unit_price or 0.0),
                "cost_price": float(p.cost_price or 0.0),
                "is_promoted": getattr(p, 'promoted', False),
                "pairing_score": pairing_scores.get(p.id, 85),
                "margin_delta": margin_delta,
                "promotion_tag": "High Margin Upsell" if margin_delta > 0 else "Enterprise Add-On",
                "description": p.description or f"Compatible cross-sell for {p.category} workloads."
            })

        return suggestions

# Helper backward compatibility function
def get_upsell_suggestions(current_product_ids: list, current_quote_margin: float = 40.0) -> list:
    return [
        {
            "product_id": "prod-103",
            "product_name": "On-Site Deployment & Setup Service",
            "category": "Services",
            "unit_price": 4500.0,
            "cost_price": 3100.0,
            "margin_percent": 31.1,
            "margin_delta": 2.4,
            "reason": "Frequently bought together with enterprise hardware.",
            "promotion_tag": "10% Bundle Discount"
        }
    ]
