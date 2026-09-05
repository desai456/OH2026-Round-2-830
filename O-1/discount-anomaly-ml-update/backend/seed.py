import sys
import os

# Add root project path to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.database import engine, Base, SessionLocal
from backend.models import (
    User, Product, DiscountTier, Warehouse, Inventory,
    SubscriptionPlan, Quotation, QuoteItem, ApprovalRecord,
    DealHealthAlert, AuditLog
)

def seed_database():
    print("Creating all database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(User).first():
            print("Database already contains data! Skipping seed.")
            return
            
        print("Seeding users...")
        db.add_all([
            User(id="usr-001", email="alex.morgan@dealflow360.com", password_hash="hash", full_name="Alex Morgan", role="Sales Rep", customer_tier="Gold", company_name="DealFlow360 Internal"),
            User(id="usr-002", email="sarah.vance@dealflow360.com", password_hash="hash", full_name="Sarah Vance", role="Sales Manager", customer_tier="Gold", company_name="DealFlow360 Internal"),
            User(id="usr-003", email="marcus.brody@dealflow360.com", password_hash="hash", full_name="Marcus Brody", role="Finance", customer_tier="Gold", company_name="DealFlow360 Internal"),
            User(id="usr-004", email="buyer@acmecorp.com", password_hash="hash", full_name="John Miller", role="Customer", customer_tier="Gold", company_name="Acme Corp")
        ])
        
        print("Seeding products...")
        db.add_all([
            Product(id="prod-101", sku="HW-SRV-900", name="Enterprise Blade Server X9", category="Hardware", unit_price=12500.00, cost_price=7800.00, unit="unit", tax_rate=18.00, description="High-density compute rack server.", promoted=True),
            Product(id="prod-102", sku="HW-SW-48P", name="48-Port Managed Core Switch", category="Hardware", unit_price=3400.00, cost_price=1900.00, unit="unit", tax_rate=18.00, description="L3 Managed Gigabit switch with PoE+.", promoted=False),
            Product(id="prod-103", sku="SV-IMP-100", name="On-Site Deployment & Setup Service", category="Services", unit_price=4500.00, cost_price=3100.00, unit="package", tax_rate=18.00, description="Professional installation and setup.", promoted=False),
            Product(id="prod-104", sku="SUB-CLD-ENT", name="Enterprise Cloud Suite (Tier 1)", category="Subscriptions", unit_price=12500.00, cost_price=2000.00, unit="license", tax_rate=18.00, description="Annual recurring cloud SaaS suite.", promoted=True),
            Product(id="prod-105", sku="SUB-SEC-PLT", name="Platinum Security & Analytics Add-on", category="Subscriptions", unit_price=4800.00, cost_price=800.00, unit="license", tax_rate=18.00, description="Real-time threat monitoring module.", promoted=False)
        ])
        
        print("Seeding discount tiers...")
        db.add_all([
            DiscountTier(id="dt-1", customer_tier="Bronze", category="Hardware", max_discount_percent=5.0),
            DiscountTier(id="dt-2", customer_tier="Bronze", category="Services", max_discount_percent=3.0),
            DiscountTier(id="dt-3", customer_tier="Bronze", category="Subscriptions", max_discount_percent=5.0),
            DiscountTier(id="dt-4", customer_tier="Silver", category="Hardware", max_discount_percent=10.0),
            DiscountTier(id="dt-5", customer_tier="Silver", category="Services", max_discount_percent=5.0),
            DiscountTier(id="dt-6", customer_tier="Silver", category="Subscriptions", max_discount_percent=10.0),
            DiscountTier(id="dt-7", customer_tier="Gold", category="Hardware", max_discount_percent=15.0),
            DiscountTier(id="dt-8", customer_tier="Gold", category="Services", max_discount_percent=10.0),
            DiscountTier(id="dt-9", customer_tier="Gold", category="Subscriptions", max_discount_percent=15.0)
        ])
        
        print("Seeding warehouses & inventory...")
        db.add_all([
            Warehouse(id="wh-01", name="Main Warehouse (Central)", code="MAIN-WH", location="Chicago, IL", shipping_cost_weight=1.00),
            Warehouse(id="wh-02", name="East Coast Logistics Hub", code="EAST-HUB", location="Newark, NJ", shipping_cost_weight=1.25),
            Warehouse(id="wh-03", name="West Depot", code="WEST-DEPOT", location="Reno, NV", shipping_cost_weight=1.40)
        ])
        
        db.add_all([
            Inventory(id="inv-01", warehouse_id="wh-01", product_id="prod-101", quantity_on_hand=45, quantity_reserved=5),
            Inventory(id="inv-02", warehouse_id="wh-02", product_id="prod-101", quantity_on_hand=12, quantity_reserved=0),
            Inventory(id="inv-03", warehouse_id="wh-01", product_id="prod-102", quantity_on_hand=80, quantity_reserved=10),
            Inventory(id="inv-04", warehouse_id="wh-02", product_id="prod-102", quantity_on_hand=30, quantity_reserved=2)
        ])
        
        print("Seeding subscription plans...")
        db.add_all([
            SubscriptionPlan(id="subplan-1", product_id="prod-104", plan_name="Enterprise Cloud Suite (Annual)", billing_cycle="Annual", mrr_amount=12500.00, arr_amount=150000.00),
            SubscriptionPlan(id="subplan-2", product_id="prod-105", plan_name="Platinum Security & Analytics (Monthly)", billing_cycle="Monthly", mrr_amount=4800.00, arr_amount=57600.00)
        ])
        
        print("Seeding sample quotations...")
        db.add_all([
            Quotation(id="q-1042", quote_number="QT-2026-1042", customer_name="Acme Corp", customer_tier="Gold", rep_name="Alex Morgan", status="Pending Approval", blended_risk_score=72, approval_required="Sales Manager & Finance", subtotal=165000.00, total_discount=33000.00, grand_total=132000.00, margin_percent=41.50),
            Quotation(id="q-1041", quote_number="QT-2026-1041", customer_name="Stark Industries", customer_tier="Gold", rep_name="Alex Morgan", status="Approved", blended_risk_score=12, approval_required="None", subtotal=98000.00, total_discount=4900.00, grand_total=93100.00, margin_percent=48.20),
            Quotation(id="q-1040", quote_number="QT-2026-1040", customer_name="Wayne Enterprises", customer_tier="Silver", rep_name="Sarah Vance", status="Under Negotiation", blended_risk_score=45, approval_required="Sales Manager", subtotal=110000.00, total_discount=11000.00, grand_total=99000.00, margin_percent=44.00)
        ])
        
        db.add_all([
            QuoteItem(id="qi-01", quotation_id="q-1042", product_id="prod-101", product_name="Enterprise Blade Server X9", category="Hardware", quantity=10, unit_price=12500.00, cost_price=7800.00, discount_percent=20.00, line_total=100000.00, line_margin=22.00, is_recurring=False),
            QuoteItem(id="qi-02", quotation_id="q-1042", product_id="prod-104", product_name="Enterprise Cloud Suite (Tier 1)", category="Subscriptions", quantity=1, unit_price=12500.00, cost_price=2000.00, discount_percent=10.00, line_total=11250.00, line_margin=82.20, is_recurring=True, billing_cycle="Annual")
        ])
        
        db.add_all([
            ApprovalRecord(id="app-01", quotation_id="q-1042", step="Sales Manager", status="Approved", approver_name="Sarah Vance", comments="Approved 20% hardware discount due to strategic account growth."),
            ApprovalRecord(id="app-02", quotation_id="q-1042", step="Finance", status="Pending", approver_name="Marcus Brody", comments="Under review for margin preservation.")
        ])
        
        db.add_all([
            DealHealthAlert(id="dh-01", quotation_id="q-1040", customer_name="Wayne Enterprises", alert_type="Stalled Deal", severity="High", description="Quotation inactive in negotiation stage for 8 consecutive days."),
            DealHealthAlert(id="dh-02", quotation_id="q-1042", customer_name="Acme Corp", alert_type="Discount Anomaly", severity="Critical", description="20% discount on Hardware exceeds Gold tier ceiling by 5 percentage points.")
        ])
        
        db.add_all([
            AuditLog(id="log-01", entity_type="Quotation", entity_id="q-1042", action="Created Quotation", performed_by="Alex Morgan", details="Initial quote QT-2026-1042 created with 2 line items."),
            AuditLog(id="log-02", entity_type="Quotation", entity_id="q-1042", action="Submitted for Approval", performed_by="Alex Morgan", details="Blended risk score 72 triggered Sales Manager & Finance approval flow.")
        ])
        
        db.commit()
        print("Database seeded successfully with sample B2B DealFlow360 data!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
