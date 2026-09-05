-- DealFlow360 PostgreSQL Database Schema
-- An Intelligent, Self Governing Sales Operations Platform

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'Sales Rep', -- 'Sales Rep', 'Sales Manager', 'Finance', 'Customer', 'Admin'
    customer_tier VARCHAR(50) DEFAULT 'Gold', -- 'Bronze', 'Silver', 'Gold', 'Platinum'
    company_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) PRIMARY KEY,
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'Hardware', 'Services', 'Subscriptions'
    unit_price NUMERIC(12, 2) NOT NULL,
    cost_price NUMERIC(12, 2) NOT NULL,
    unit VARCHAR(50) DEFAULT 'unit',
    tax_rate NUMERIC(5, 2) DEFAULT 18.00,
    description TEXT,
    promoted BOOLEAN DEFAULT FALSE,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS discount_tiers (
    id VARCHAR(50) PRIMARY KEY,
    customer_tier VARCHAR(50) NOT NULL, -- 'Bronze', 'Silver', 'Gold'
    category VARCHAR(100) NOT NULL, -- 'Hardware', 'Services', 'Subscriptions'
    max_discount_percent NUMERIC(5, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_tier_category UNIQUE (customer_tier, category)
);

CREATE TABLE IF NOT EXISTS warehouses (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    location VARCHAR(255) NOT NULL,
    shipping_cost_weight NUMERIC(8, 2) DEFAULT 1.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory (
    id VARCHAR(50) PRIMARY KEY,
    warehouse_id VARCHAR(50) REFERENCES warehouses(id) ON DELETE CASCADE,
    product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
    quantity_on_hand INT NOT NULL DEFAULT 0,
    quantity_reserved INT NOT NULL DEFAULT 0,
    reorder_level INT DEFAULT 10,
    CONSTRAINT unique_warehouse_product UNIQUE (warehouse_id, product_id)
);

CREATE TABLE IF NOT EXISTS subscription_plans (
    id VARCHAR(50) PRIMARY KEY,
    product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
    plan_name VARCHAR(255) NOT NULL,
    billing_cycle VARCHAR(50) NOT NULL, -- 'Monthly', 'Annual'
    mrr_amount NUMERIC(12, 2) NOT NULL,
    arr_amount NUMERIC(12, 2) NOT NULL,
    proration_policy VARCHAR(100) DEFAULT 'Pro-rated Daily',
    cancellation_rules TEXT
);

CREATE TABLE IF NOT EXISTS quotations (
    id VARCHAR(50) PRIMARY KEY,
    quote_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_tier VARCHAR(50) DEFAULT 'Gold',
    rep_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Draft', -- 'Draft', 'Pending Approval', 'Approved', 'Rejected', 'Under Negotiation', 'Confirmed'
    blended_risk_score INT DEFAULT 0,
    approval_required VARCHAR(100) DEFAULT 'None', -- 'None', 'Sales Manager', 'Sales Manager & Finance'
    subtotal NUMERIC(12, 2) DEFAULT 0.00,
    total_discount NUMERIC(12, 2) DEFAULT 0.00,
    total_tax NUMERIC(12, 2) DEFAULT 0.00,
    grand_total NUMERIC(12, 2) DEFAULT 0.00,
    total_cost NUMERIC(12, 2) DEFAULT 0.00,
    margin_percent NUMERIC(5, 2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quote_items (
    id VARCHAR(50) PRIMARY KEY,
    quotation_id VARCHAR(50) REFERENCES quotations(id) ON DELETE CASCADE,
    product_id VARCHAR(50) REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(12, 2) NOT NULL,
    cost_price NUMERIC(12, 2) NOT NULL,
    discount_percent NUMERIC(5, 2) DEFAULT 0.00,
    line_total NUMERIC(12, 2) NOT NULL,
    line_margin NUMERIC(5, 2) DEFAULT 0.00,
    is_recurring BOOLEAN DEFAULT FALSE,
    billing_cycle VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS approval_records (
    id VARCHAR(50) PRIMARY KEY,
    quotation_id VARCHAR(50) REFERENCES quotations(id) ON DELETE CASCADE,
    step VARCHAR(100) NOT NULL, -- 'Sales Manager', 'Finance'
    status VARCHAR(50) NOT NULL DEFAULT 'Pending', -- 'Pending', 'Approved', 'Rejected'
    approver_name VARCHAR(255),
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    action_date TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS fulfillment_splits (
    id VARCHAR(50) PRIMARY KEY,
    quotation_id VARCHAR(50) REFERENCES quotations(id) ON DELETE CASCADE,
    warehouse_id VARCHAR(50) REFERENCES warehouses(id),
    warehouse_name VARCHAR(255) NOT NULL,
    product_id VARCHAR(50) REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    quantity_fulfilled INT NOT NULL,
    shipment_count INT DEFAULT 1,
    shipping_cost NUMERIC(12, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'Allocated'
);

CREATE TABLE IF NOT EXISTS invoices (
    id VARCHAR(50) PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    quotation_id VARCHAR(50) REFERENCES quotations(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    billing_type VARCHAR(100) NOT NULL, -- 'One-Time Order', 'Recurring Subscription'
    amount NUMERIC(12, 2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Unpaid', -- 'Paid', 'Unpaid', 'Overdue'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customer_negotiations (
    id VARCHAR(50) PRIMARY KEY,
    quotation_id VARCHAR(50) REFERENCES quotations(id) ON DELETE CASCADE,
    author_name VARCHAR(255) NOT NULL,
    author_role VARCHAR(50) NOT NULL, -- 'Customer', 'Sales Rep'
    comment TEXT NOT NULL,
    proposed_discount NUMERIC(5, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS deal_health_alerts (
    id VARCHAR(50) PRIMARY KEY,
    quotation_id VARCHAR(50) REFERENCES quotations(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    alert_type VARCHAR(100) NOT NULL, -- 'Stalled Deal', 'Discount Anomaly', 'Delivery Slippage'
    severity VARCHAR(50) DEFAULT 'Medium', -- 'Low', 'Medium', 'High', 'Critical'
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(50) NOT NULL,
    action VARCHAR(255) NOT NULL,
    performed_by VARCHAR(255) NOT NULL,
    details TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
