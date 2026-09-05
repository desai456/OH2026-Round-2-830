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

class Customer(Base):
    __tablename__ = "customers"

    id = Column(String(50), primary_key=True)
    name = Column(String(255), nullable=False)
    tier = Column(String(50), nullable=False, default="Gold") # 'Bronze', 'Silver', 'Gold'
    email = Column(String(255))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ProductCategory(Base):
    __tablename__ = "product_categories"

    id = Column(String(50), primary_key=True)
    name = Column(String(255), nullable=False)
    default_margin_pct = Column(Numeric(5, 2), default=30.00)
    max_discount_limit_pct = Column(Numeric(5, 2), default=15.00)

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

class DiscountTierRule(Base):
    __tablename__ = "discount_tier_rules"

    id = Column(String(50), primary_key=True)
    customer_tier = Column(String(50), nullable=False) # 'Bronze', 'Silver', 'Gold'
    product_category_id = Column(String(50), nullable=True)
    category_name = Column(String(100), nullable=True) # Fallback / direct name match
    max_allowed_discount_pct = Column(Numeric(5, 2), nullable=False)

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

    @property
    def available_qty(self):
        return max(0, (self.quantity_on_hand or 0) - (self.quantity_reserved or 0))

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
    customer_id = Column(String(50), nullable=True)
    customer_name = Column(String(255), nullable=False)
    customer_tier = Column(String(50), default="Gold")
    rep_name = Column(String(255), nullable=False)
    status = Column(String(50), default="Draft") # 'Draft', 'Pending Approval', 'Approved', 'Rejected', 'FULFILLMENT', 'PENDING_MANAGER_APPROVAL', 'PENDING_FINANCE_APPROVAL'
    blended_risk_score = Column(Numeric(5, 2), default=0.0)
    approval_required = Column(String(100), default="None")
    escalate_to_finance = Column(Boolean, default=False)
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
    product_category_id = Column(String(50), nullable=True)
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

    @property
    def applied_discount_pct(self):
        return float(self.discount_percent or 0.0)

    @applied_discount_pct.setter
    def applied_discount_pct(self, val):
        self.discount_percent = val

# Alias QuotationLine to QuoteItem for standard compliance
QuotationLine = QuoteItem

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

class FulfillmentOrder(Base):
    __tablename__ = "fulfillment_orders"

    id = Column(String(50), primary_key=True)
    quotation_id = Column(String(50), ForeignKey("quotations.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default="PENDING") # 'PENDING', 'PARTIAL', 'FULFILLED'
    total_shipments = Column(Integer, default=1)
    total_shipping_cost = Column(Numeric(12, 2), default=0.00)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    splits = relationship("FulfillmentSplit", back_populates="fulfillment_order", cascade="all, delete-orphan")
    backorders = relationship("Backorder", back_populates="fulfillment_order", cascade="all, delete-orphan")

class FulfillmentSplit(Base):
    __tablename__ = "fulfillment_splits"

    id = Column(String(50), primary_key=True)
    fulfillment_order_id = Column(String(50), ForeignKey("fulfillment_orders.id", ondelete="CASCADE"), nullable=True)
    quotation_id = Column(String(50), ForeignKey("quotations.id", ondelete="CASCADE"))
    warehouse_id = Column(String(50), ForeignKey("warehouses.id"))
    warehouse_name = Column(String(255), nullable=False)
    product_id = Column(String(50), ForeignKey("products.id"))
    product_name = Column(String(255), nullable=False)
    quantity_fulfilled = Column(Integer, nullable=False)
    shipment_count = Column(Integer, default=1)
    shipping_cost = Column(Numeric(12, 2), default=0.00)
    status = Column(String(50), default="Allocated")

    fulfillment_order = relationship("FulfillmentOrder", back_populates="splits")

    @property
    def allocated_qty(self):
        return int(self.quantity_fulfilled or 0)

    @allocated_qty.setter
    def allocated_qty(self, val):
        self.quantity_fulfilled = val

class Backorder(Base):
    __tablename__ = "backorders"

    id = Column(String(50), primary_key=True)
    quotation_id = Column(String(50), ForeignKey("quotations.id", ondelete="CASCADE"), nullable=False)
    fulfillment_order_id = Column(String(50), ForeignKey("fulfillment_orders.id", ondelete="SET NULL"), nullable=True)
    product_id = Column(String(50), ForeignKey("products.id"), nullable=False)
    product_name = Column(String(255), nullable=True)
    missing_qty = Column(Integer, nullable=False)
    status = Column(String(50), default="WAITING") # 'WAITING', 'CONSOLIDATED', 'CANCELLED'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    fulfillment_order = relationship("FulfillmentOrder", back_populates="backorders")


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(String(50), primary_key=True)
    invoice_number = Column(String(50), unique=True, nullable=False)
    order_id = Column(String(50), ForeignKey("orders.id", ondelete="SET NULL"), nullable=True)
    quotation_id = Column(String(50), ForeignKey("quotations.id", ondelete="CASCADE"), nullable=True)
    customer_name = Column(String(255), nullable=False)
    billing_type = Column(String(100), nullable=False, default="Initial")
    type = Column(String(50), default="INITIAL") # 'INITIAL', 'RECURRING', 'PRORATED', 'REFUND', 'ONE_TIME'
    amount = Column(Numeric(12, 2), nullable=False)
    due_date = Column(Date, nullable=False)
    status = Column(String(50), default="Unpaid")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    order = relationship("Order", back_populates="invoices")

    @property
    def total_amount(self):
        return float(self.amount or 0.0)

    @total_amount.setter
    def total_amount(self, val):
        self.amount = val

class Order(Base):
    __tablename__ = "orders"

    id = Column(String(50), primary_key=True)
    quotation_id = Column(String(50), ForeignKey("quotations.id", ondelete="SET NULL"), nullable=True)
    order_number = Column(String(50), unique=True, nullable=False)
    customer_name = Column(String(255), nullable=False)
    customer_tier = Column(String(50), default="Gold")
    total_amount = Column(Numeric(12, 2), default=0.00)
    status = Column(String(50), default="CONFIRMED") # 'CONFIRMED', 'ACTIVE', 'COMPLETED'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    lines = relationship("OrderLine", back_populates="order", cascade="all, delete-orphan")
    schedules = relationship("BillingSchedule", back_populates="order", cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="order")
    credit_notes = relationship("CreditNote", back_populates="order", cascade="all, delete-orphan")

class OrderLine(Base):
    __tablename__ = "order_lines"

    id = Column(String(50), primary_key=True)
    order_id = Column(String(50), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(String(50), ForeignKey("products.id"), nullable=True)
    product_name = Column(String(255), nullable=False)
    line_type = Column(String(50), nullable=False, default="ONE_TIME") # 'ONE_TIME', 'RECURRING'
    unit_price = Column(Numeric(12, 2), nullable=False)
    quantity = Column(Integer, default=1)
    applied_discount_pct = Column(Numeric(5, 2), default=0.00)
    subscription_plan_id = Column(String(50), ForeignKey("subscription_plans.id", ondelete="SET NULL"), nullable=True)
    billing_cycle = Column(String(50), default="MONTHLY") # 'MONTHLY', 'QUARTERLY', 'YEARLY'
    cycle_start_date = Column(Date, nullable=True)
    cycle_end_date = Column(Date, nullable=True)
    status = Column(String(50), default="ACTIVE") # 'ACTIVE', 'MODIFIED', 'CANCELLED'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    order = relationship("Order", back_populates="lines")
    subscription_plan = relationship("SubscriptionPlan")
    schedules = relationship("BillingSchedule", back_populates="order_line", cascade="all, delete-orphan")

class BillingSchedule(Base):
    __tablename__ = "billing_schedules"

    id = Column(String(50), primary_key=True)
    order_id = Column(String(50), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    order_line_id = Column(String(50), ForeignKey("order_lines.id", ondelete="CASCADE"), nullable=False)
    next_billing_date = Column(Date, nullable=False)
    amount_due = Column(Numeric(12, 2), nullable=False)
    status = Column(String(50), default="SCHEDULED") # 'SCHEDULED', 'BILLED', 'CANCELLED'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    order = relationship("Order", back_populates="schedules")
    order_line = relationship("OrderLine", back_populates="schedules")

class CreditNote(Base):
    __tablename__ = "credit_notes"

    id = Column(String(50), primary_key=True)
    order_id = Column(String(50), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    order_line_id = Column(String(50), ForeignKey("order_lines.id", ondelete="SET NULL"), nullable=True)
    amount = Column(Numeric(12, 2), nullable=False)
    reason = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    order = relationship("Order", back_populates="credit_notes")

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
    quotation_id = Column(String(50), nullable=True)
    user_id = Column(String(50), nullable=True)
    action = Column(String(255), nullable=False) # 'SUBMIT', 'APPROVE', 'REJECT', 'COUNTER', etc.
    previous_stage = Column(String(100), nullable=True)
    new_stage = Column(String(100), nullable=True)
    rationale_note = Column(Text, nullable=True)
    entity_type = Column(String(100), nullable=True, default="Quotation")
    entity_id = Column(String(50), nullable=True)
    performed_by = Column(String(255), nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)


