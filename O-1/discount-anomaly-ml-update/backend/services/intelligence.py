"""
DealFlow360 Intelligence Engine
Provides live upsell/cross-sell recommendations with margin impact,
and monitors deal health for stalled quotes & discount anomalies.
"""

CO_PURCHASE_PAIRINGS = {
    "prod-101": [
        {"suggested_product_id": "prod-103", "suggested_name": "On-Site Deployment & Setup Service", "category": "Services", "unit_price": 4500.0, "cost_price": 3100.0, "reason": "Frequently bought together with Blade Server X9 (94% co-purchase rate).", "promotion": "10% Bundle Discount"},
        {"suggested_product_id": "prod-105", "suggested_name": "Platinum Security & Analytics Add-on", "category": "Subscriptions", "unit_price": 4800.0, "cost_price": 800.0, "reason": "Recommended security enhancement for enterprise workloads.", "promotion": "High Margin Cross-sell"}
    ],
    "prod-102": [
        {"suggested_product_id": "prod-103", "suggested_name": "On-Site Deployment & Setup Service", "category": "Services", "unit_price": 4500.0, "cost_price": 3100.0, "reason": "Professional network switch configuration service.", "promotion": "Standard Add-on"}
    ]
}

def get_upsell_suggestions(current_product_ids: list, current_quote_margin: float = 40.0) -> list:
    suggestions = []
    seen_ids = set(current_product_ids)
    
    for pid in current_product_ids:
        pairings = CO_PURCHASE_PAIRINGS.get(pid, [])
        for p in pairings:
            s_id = p["suggested_product_id"]
            if s_id not in seen_ids:
                seen_ids.add(s_id)
                # Compute margin impact
                price = p["unit_price"]
                cost = p["cost_price"]
                item_margin = ((price - cost) / price) * 100.0 if price > 0 else 0.0
                margin_delta = round(item_margin - current_quote_margin, 1)
                
                suggestions.append({
                    "product_id": s_id,
                    "product_name": p["suggested_name"],
                    "category": p["category"],
                    "unit_price": price,
                    "cost_price": cost,
                    "margin_percent": round(item_margin, 1),
                    "margin_delta": margin_delta,
                    "reason": p["reason"],
                    "promotion_tag": p["promotion"]
                })
                
    return suggestions

def evaluate_deal_health(quotation: dict, days_inactive: int = 0) -> list:
    alerts = []
    
    # 1. Stalled Deal Check
    if quotation.get("status") in ["Draft", "Pending Approval", "Under Negotiation"] and days_inactive >= 7:
        alerts.append({
            "alert_type": "Stalled Deal",
            "severity": "High" if days_inactive >= 14 else "Medium",
            "description": f"Quotation {quotation.get('quote_number')} has been inactive for {days_inactive} days in '{quotation.get('status')}' status."
        })
        
    # 2. Discount Anomaly Check
    blended_risk = quotation.get("blended_risk_score", 0)
    if blended_risk > 60:
        alerts.append({
            "alert_type": "Discount Anomaly",
            "severity": "Critical" if blended_risk > 80 else "High",
            "description": f"Blended risk score of {blended_risk} exceeds safe margin thresholds."
        })
        
    return alerts
