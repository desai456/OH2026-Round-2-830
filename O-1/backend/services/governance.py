"""
DealFlow360 Blended Discount Risk Score & Approval Chain Routing Engine
Calculates category-based ceiling breaches, computes overall blended risk score,
and determines if Sales Manager, Finance, or no approval is required.
"""

# Default Category Ceilings per Customer Tier (%)
DEFAULT_TIER_LIMITS = {
    "Bronze": {"Hardware": 5.0, "Services": 3.0, "Subscriptions": 5.0},
    "Silver": {"Hardware": 10.0, "Services": 5.0, "Subscriptions": 10.0},
    "Gold": {"Hardware": 15.0, "Services": 10.0, "Subscriptions": 15.0},
    "Platinum": {"Hardware": 20.0, "Services": 15.0, "Subscriptions": 20.0},
}

def calculate_blended_risk(items: list, customer_tier: str = "Gold") -> dict:
    """
    Calculates:
    - line_violations: points over limit per line item
    - blended_risk_score: 0 to 100 integer score
    - approval_required: 'None', 'Sales Manager', or 'Sales Manager & Finance'
    """
    tier_limits = DEFAULT_TIER_LIMITS.get(customer_tier, DEFAULT_TIER_LIMITS["Gold"])
    
    total_quote_value = 0.0
    total_excess_discount_dollars = 0.0
    max_line_excess_points = 0.0
    has_critical_breach = False
    
    line_analysis = []
    
    for item in items:
        category = item.get("category", "Hardware")
        discount = float(item.get("discount_percent", 0.0))
        quantity = int(item.get("quantity", 1))
        unit_price = float(item.get("unit_price", 0.0))
        
        allowed_limit = tier_limits.get(category, 10.0)
        line_total = quantity * unit_price * (1 - discount / 100.0)
        total_quote_value += line_total
        
        excess_points = max(0.0, discount - allowed_limit)
        if excess_points > max_line_excess_points:
            max_line_excess_points = excess_points
            
        if excess_points > 0:
            excess_dollars = (excess_points / 100.0) * (quantity * unit_price)
            total_excess_discount_dollars += excess_dollars
            
        if excess_points > 10.0:
            has_critical_breach = True
            
        line_analysis.append({
            "product_name": item.get("product_name"),
            "category": category,
            "discount_given": discount,
            "allowed_limit": allowed_limit,
            "excess_points": excess_points
        })
        
    # Blended Risk Score formula:
    # Blend of max line excess + weighted excess dollar ratio across order
    value_risk_factor = (total_excess_discount_dollars / max(total_quote_value, 1.0)) * 100.0
    raw_score = (max_line_excess_points * 4.0) + (value_risk_factor * 2.0)
    blended_risk_score = min(100, int(round(raw_score)))
    
    # Route approvals based on blended risk score & thresholds
    if blended_risk_score == 0 and not has_critical_breach:
        approval_required = "None"
    elif blended_risk_score <= 50 and not has_critical_breach:
        approval_required = "Sales Manager"
    else:
        approval_required = "Sales Manager & Finance"
        
    return {
        "blended_risk_score": blended_risk_score,
        "approval_required": approval_required,
        "line_analysis": line_analysis
    }
