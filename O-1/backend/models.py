import datetime
from sqlalchemy import Column, String, Integer, Numeric, Boolean, Text, DateTime, Date, ForeignKey
from sqlalchemy.orm import relationship

try:
    from backend.database import Base
except ImportError:
    from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(50), primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="Sales Rep") # 'Sales Rep', 'Sales Manager', 'Finance', 'Customer', 'Admin'
    customer_tier = Column(String(50), default="Gold") # 'Bronze', 'Silver', 'Gold'
    company_name = Column(String(255))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Product(Base):
    __tablename__ = "products"

    id = Column(String(50), primary_key=True)
    sku = Column(String(100), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False) # 'Hardware', 'Services', 'Subscriptions'
    unit_price = Column(Numeric(12, 2), nullable=False)
    cost_price = Column(Numeric(12, 2), nullable=False)
    unit = Column(String(50), default="unit")
    tax_rate = Column(Numeric(5, 2), default=18.00)
    description = Column(Text)
    promoted = Column(Boolean, default=False)
    image_url = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class DiscountTier(Base):
    __tablename__ = "discount_tiers"

    id = Column(String(50), primary_key=True)
    customer_tier = Column(String(50), nullable=False)
    category = Column(String(100), nullable=False)
    max_discount_percent = Column(Numeric(5, 2), nullable=False)

class Warehouse(Base):
    __tablename__ = "warehouses"

    id = Column(String(50), primary_key=True)
    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    location = Column(String(255), nullable=False)
    shipping_cost_weight = Column(Numeric(8, 2), default=1.00)

class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(String(50), primary_key=True)
    warehouse_id = Column(String(50), ForeignKey("warehouses.id", ondelete="CASCADE"))
    product_id = Column(String(50), ForeignKey("products.id", ondelete="CASCADE"))
    quantity_on_hand = Column(Integer, default=0)
    quantity_reserved = Column(Integer, default=0)
    reorder_level = Column(Integer, default=10)

class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"

    id = Column(String(50), primary_key=True)
    product_id = Column(String(50), ForeignKey("products.id", ondelete="CASCADE"))
    plan_name = Column(String(255), nullable=False)
    billing_cycle = Column(String(50), nullable=False) # 'Monthly', 'Annual'
    mrr_amount = Column(Numeric(12, 2), nullable=False)
    arr_amount = Column(Numeric(12, 2), nullable=False)
    proration_policy = Column(String(100), default="Pro-rated Daily")

class Quotation(Base):
    __tablename__ = "quotations"

    id = Column(String(50), primary_key=True)
    quote_number = Column(String(50), unique=True, nullable=False)
    customer_name = Column(String(255), nullable=False)
    customer_tier = Column(String(50), default="Gold")
    rep_name = Column(String(255), nullable=False)
    status = Column(String(50), default="Draft") # 'Draft', 'Pending Approval', 'Approved', 'Rejected', 'Under Negotiation', 'Confirmed'
    blended_risk_score = Column(Integer, default=0)
    approval_required = Column(String(100), default="None")
    subtotal = Column(Numeric(12, 2), default=0.00)
    total_discount = Column(Numeric(12, 2), default=0.00)
    total_tax = Column(Numeric(12, 2), default=0.00)
    grand_total = Column(Numeric(12, 2), default=0.00)
    total_cost = Column(Numeric(12, 2), default=0.00)
    margin_percent = Column(Numeric(5, 2), default=0.00)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    items = relationship("QuoteItem", back_populates="quotation", cascade="all, delete-orphan")
    approvals = relationship("ApprovalRecord", back_populates="quotation", cascade="all, delete-orphan")

class QuoteItem(Base):
    __tablename__ = "quote_items"

    id = Column(String(50), primary_key=True)
    quotation_id = Column(String(50), ForeignKey("quotations.id", ondelete="CASCADE"))
    product_id = Column(String(50), ForeignKey("products.id"))
    product_name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    quantity = Column(Integer, default=1)
    unit_price = Column(Numeric(12, 2), nullable=False)
    cost_price = Column(Numeric(12, 2), nullable=False)
    discount_percent = Column(Numeric(5, 2), default=0.00)
    line_total = Column(Numeric(12, 2), nullable=False)
    line_margin = Column(Numeric(5, 2), default=0.00)
    is_recurring = Column(Boolean, default=False)
    billing_cycle = Column(String(50))

    quotation = relationship("Quotation", back_populates="items")

class ApprovalRecord(Base):
    __tablename__ = "approval_records"

    id = Column(String(50), primary_key=True)
    quotation_id = Column(String(50), ForeignKey("quotations.id", ondelete="CASCADE"))
    step = Column(String(100), nullable=False) # 'Sales Manager', 'Finance'
    status = Column(String(50), default="Pending") # 'Pending', 'Approved', 'Rejected'
    approver_name = Column(String(255))
    comments = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    quotation = relationship("Quotation", back_populates="approvals")

class FulfillmentSplit(Base):
    __tablename__ = "fulfillment_splits"

    id = Column(String(50), primary_key=True)
    quotation_id = Column(String(50), ForeignKey("quotations.id", ondelete="CASCADE"))
    warehouse_id = Column(String(50), ForeignKey("warehouses.id"))
    warehouse_name = Column(String(255), nullable=False)
    product_id = Column(String(50), ForeignKey("products.id"))
    product_name = Column(String(255), nullable=False)
    quantity_fulfilled = Column(Integer, nullable=False)
    shipment_count = Column(Integer, default=1)
    shipping_cost = Column(Numeric(12, 2), default=0.00)
    status = Column(String(50), default="Allocated")

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(String(50), primary_key=True)
    invoice_number = Column(String(50), unique=True, nullable=False)
    quotation_id = Column(String(50), ForeignKey("quotations.id", ondelete="CASCADE"))
    customer_name = Column(String(255), nullable=False)
    billing_type = Column(String(100), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    due_date = Column(Date, nullable=False)
    status = Column(String(50), default="Unpaid")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class CustomerNegotiation(Base):
    __tablename__ = "customer_negotiations"

    id = Column(String(50), primary_key=True)
    quotation_id = Column(String(50), ForeignKey("quotations.id", ondelete="CASCADE"))
    author_name = Column(String(255), nullable=False)
    author_role = Column(String(50), nullable=False)
    comment = Column(Text, nullable=False)
    proposed_discount = Column(Numeric(5, 2))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class DealHealthAlert(Base):
    __tablename__ = "deal_health_alerts"

    id = Column(String(50), primary_key=True)
    quotation_id = Column(String(50), ForeignKey("quotations.id", ondelete="CASCADE"))
    customer_name = Column(String(255), nullable=False)
    alert_type = Column(String(100), nullable=False) # 'Stalled Deal', 'Discount Anomaly', 'Delivery Slippage'
    severity = Column(String(50), default="Medium")
    description = Column(Text, nullable=False)
    status = Column(String(50), default="Active")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(50), primary_key=True)
    entity_type = Column(String(100), nullable=False)
    entity_id = Column(String(50), nullable=False)
    action = Column(String(255), nullable=False)
    performed_by = Column(String(255), nullable=False)
    details = Column(Text)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
