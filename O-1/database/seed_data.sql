-- DealFlow360 Seed Data SQL

INSERT INTO users (id, email, password_hash, full_name, role, customer_tier, company_name) VALUES
('usr-001', 'alex.morgan@dealflow360.com', '$2b$12$e8Y/1...mockhash', 'Alex Morgan', 'Sales Rep', 'Gold', 'DealFlow360 Internal'),
('usr-002', 'sarah.vance@dealflow360.com', '$2b$12$e8Y/1...mockhash', 'Sarah Vance', 'Sales Manager', 'Gold', 'DealFlow360 Internal'),
('usr-003', 'marcus.brody@dealflow360.com', '$2b$12$e8Y/1...mockhash', 'Marcus Brody', 'Finance', 'Gold', 'DealFlow360 Internal'),
('usr-004', 'buyer@acmecorp.com', '$2b$12$e8Y/1...mockhash', 'John Miller', 'Customer', 'Gold', 'Acme Corp');

INSERT INTO products (id, sku, name, category, unit_price, cost_price, unit, tax_rate, description, promoted) VALUES
('prod-101', 'HW-SRV-900', 'Enterprise Blade Server X9', 'Hardware', 12500.00, 7800.00, 'unit', 18.00, 'High-density compute rack server with dual Xeon processors.', true),
('prod-102', 'HW-SW-48P', '48-Port Managed Core Switch', 'Hardware', 3400.00, 1900.00, 'unit', 18.00, 'L3 Managed Gigabit switch with PoE+ support.', false),
('prod-103', 'SV-IMP-100', 'On-Site Deployment & Setup Service', 'Services', 4500.00, 3100.00, 'package', 18.00, 'Professional installation, racking, and network setup.', false),
('prod-104', 'SUB-CLD-ENT', 'Enterprise Cloud Suite (Tier 1)', 'Subscriptions', 12500.00, 2000.00, 'license', 18.00, 'Annual recurring subscription for enterprise SaaS platform.', true),
('prod-105', 'SUB-SEC-PLT', 'Platinum Security & Analytics Add-on', 'Subscriptions', 4800.00, 800.00, 'license', 18.00, 'Real-time threat monitoring and predictive analytics module.', false);

INSERT INTO discount_tiers (id, customer_tier, category, max_discount_percent) VALUES
('dt-1', 'Bronze', 'Hardware', 5.00),
('dt-2', 'Bronze', 'Services', 3.00),
('dt-3', 'Bronze', 'Subscriptions', 5.00),
('dt-4', 'Silver', 'Hardware', 10.00),
('dt-5', 'Silver', 'Services', 5.00),
('dt-6', 'Silver', 'Subscriptions', 10.00),
('dt-7', 'Gold', 'Hardware', 15.00),
('dt-8', 'Gold', 'Services', 10.00),
('dt-9', 'Gold', 'Subscriptions', 15.00);

INSERT INTO warehouses (id, name, code, location, shipping_cost_weight) VALUES
('wh-01', 'Main Warehouse (Central)', 'MAIN-WH', 'Chicago, IL', 1.00),
('wh-02', 'East Coast Logistics Hub', 'EAST-HUB', 'Newark, NJ', 1.25),
('wh-03', 'West Depot', 'WEST-DEPOT', 'Reno, NV', 1.40);

INSERT INTO inventory (id, warehouse_id, product_id, quantity_on_hand, quantity_reserved, reorder_level) VALUES
('inv-01', 'wh-01', 'prod-101', 45, 5, 10),
('inv-02', 'wh-02', 'prod-101', 12, 0, 5),
('inv-03', 'wh-01', 'prod-102', 80, 10, 15),
('inv-04', 'wh-02', 'prod-102', 30, 2, 5),
('inv-05', 'wh-01', 'prod-103', 999, 0, 0);

INSERT INTO subscription_plans (id, product_id, plan_name, billing_cycle, mrr_amount, arr_amount, proration_policy) VALUES
('subplan-1', 'prod-104', 'Enterprise Cloud Suite (Annual)', 'Annual', 12500.00, 150000.00, 'Pro-rated Daily'),
('subplan-2', 'prod-105', 'Platinum Security & Analytics (Monthly)', 'Monthly', 4800.00, 57600.00, 'Pro-rated Daily');

INSERT INTO quotations (id, quote_number, customer_name, customer_tier, rep_name, status, blended_risk_score, approval_required, subtotal, total_discount, grand_total, margin_percent) VALUES
('q-1042', 'QT-2026-1042', 'Acme Corp', 'Gold', 'Alex Morgan', 'Pending Approval', 72, 'Sales Manager & Finance', 165000.00, 33000.00, 132000.00, 41.50),
('q-1041', 'QT-2026-1041', 'Stark Industries', 'Gold', 'Alex Morgan', 'Approved', 12, 'None', 98000.00, 4900.00, 93100.00, 48.20),
('q-1040', 'QT-2026-1040', 'Wayne Enterprises', 'Silver', 'Sarah Vance', 'Under Negotiation', 45, 'Sales Manager', 110000.00, 11000.00, 99000.00, 44.00);

INSERT INTO quote_items (id, quotation_id, product_id, product_name, category, quantity, unit_price, cost_price, discount_percent, line_total, line_margin, is_recurring, billing_cycle) VALUES
('qi-01', 'q-1042', 'prod-101', 'Enterprise Blade Server X9', 'Hardware', 10, 12500.00, 7800.00, 20.00, 100000.00, 22.00, false, null),
('qi-02', 'q-1042', 'prod-104', 'Enterprise Cloud Suite (Tier 1)', 'Subscriptions', 1, 12500.00, 2000.00, 10.00, 11250.00, 82.20, true, 'Annual');

INSERT INTO approval_records (id, quotation_id, step, status, approver_name, comments) VALUES
('app-01', 'q-1042', 'Sales Manager', 'Approved', 'Sarah Vance', 'Approved 20% hardware discount due to strategic enterprise account expansion.'),
('app-02', 'q-1042', 'Finance', 'Pending', 'Marcus Brody', 'Under review for gross margin preservation.');

INSERT INTO deal_health_alerts (id, quotation_id, customer_name, alert_type, severity, description, status) VALUES
('dh-01', 'q-1040', 'Wayne Enterprises', 'Stalled Deal', 'High', 'Quotation inactive in negotiation stage for 8 consecutive days.', 'Active'),
('dh-02', 'q-1042', 'Acme Corp', 'Discount Anomaly', 'Critical', '20% discount on Hardware exceeds Gold tier ceiling by 5 percentage points.', 'Active');

INSERT INTO audit_logs (id, entity_type, entity_id, action, performed_by, details) VALUES
('log-01', 'Quotation', 'q-1042', 'Created Quotation', 'Alex Morgan', 'Initial quote QT-2026-1042 created with 2 line items.'),
('log-02', 'Quotation', 'q-1042', 'Submitted for Approval', 'Alex Morgan', 'Blended risk score 72 triggered Sales Manager & Finance approval flow.');
