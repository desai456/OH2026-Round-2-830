"""
DealFlow360 Hybrid Billing & Subscription Engine
Separates one-time hardware/services from recurring subscription lines,
computes billing schedules, MRR/ARR trajectories, and mid-cycle proration.
"""
import datetime

def generate_hybrid_billing_schedule(quote_items: list, start_date: str = None) -> dict:
    if not start_date:
        start_date = datetime.date.today().isoformat()
        
    start_dt = datetime.datetime.strptime(start_date, "%Y-%m-%d").date()
    
    one_time_lines = []
    recurring_lines = []
    
    one_time_total = 0.0
    total_mrr = 0.0
    total_arr = 0.0
    
    for item in quote_items:
        is_recurring = item.get("is_recurring", False) or item.get("category") == "Subscriptions"
        line_total = float(item.get("line_total", 0.0))
        
        if is_recurring:
            cycle = item.get("billing_cycle", "Monthly")
            mrr = line_total / 12.0 if cycle == "Annual" else line_total
            arr = line_total if cycle == "Annual" else line_total * 12.0
            
            total_mrr += mrr
            total_arr += arr
            
            recurring_lines.append({
                "product_id": item.get("product_id"),
                "product_name": item.get("product_name"),
                "billing_cycle": cycle,
                "amount": line_total,
                "mrr": round(mrr, 2),
                "arr": round(arr, 2),
                "next_billing_date": (start_dt + datetime.timedelta(days=30 if cycle == "Monthly" else 365)).isoformat()
            })
        else:
            one_time_total += line_total
            one_time_lines.append({
                "product_id": item.get("product_id"),
                "product_name": item.get("product_name"),
                "amount": line_total
            })
            
    # Generate upcoming billing schedule entries
    schedule = []
    # 1. One-time initial invoice
    if one_time_total > 0:
        schedule.append({
            "invoice_number": f"INV-{start_dt.strftime('%Y%m')}-001",
            "type": "One-Time Hardware & Setup",
            "amount": round(one_time_total, 2),
            "due_date": start_dt.isoformat(),
            "status": "Ready for Billing"
        })
        
    # 2. Recurring subscription schedule
    if recurring_lines:
        for idx, rec in enumerate(recurring_lines, start=2):
            schedule.append({
                "invoice_number": f"SUB-{start_dt.strftime('%Y%m')}-00{idx}",
                "type": f"Recurring Subscription ({rec['billing_cycle']}) - {rec['product_name']}",
                "amount": round(rec["amount"], 2),
                "due_date": rec["next_billing_date"],
                "status": "Scheduled"
            })
            
    return {
        "one_time_total": round(one_time_total, 2),
        "total_mrr": round(total_mrr, 2),
        "total_arr": round(total_arr, 2),
        "one_time_lines": one_time_lines,
        "recurring_lines": recurring_lines,
        "billing_schedule": schedule
    }

def calculate_proration(current_mrr: float, new_mrr: float, days_remaining_in_cycle: int = 15, total_days_in_cycle: int = 30) -> dict:
    daily_delta = (new_mrr - current_mrr) / float(total_days_in_cycle)
    prorated_charge = round(daily_delta * days_remaining_in_cycle, 2)
    return {
        "prorated_amount": prorated_charge,
        "credit_or_debit": "Debit" if prorated_charge >= 0 else "Credit Note",
        "description": f"Mid-cycle adjustment for {days_remaining_in_cycle} remaining days."
    }
