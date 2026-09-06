# 🚀 DealFlow360

> **An enterprise-grade, end-to-end Deal & Quotation Management Platform** — built for modern B2B sales teams to create, negotiate, approve, fulfill, and bill complex deals from a single, unified workspace.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Folder Structure](#-folder-structure)
- [Pages & Modules](#-pages--modules)
- [User Roles & Permissions](#-user-roles--permissions)
- [Core Business Logic](#-core-business-logic)
- [Data Model](#-data-model)
- [Getting Started](#-getting-started)
- [Demo Accounts](#-demo-accounts)
- [Environment & Scripts](#-environment--scripts)
- [Future Improvements](#-future-improvements)

---

## 🌟 Project Overview

**DealFlow360** is a full-featured, SaaS-level **Deal Flow & Quotation Management System** designed for B2B companies that sell hardware, software, services, and subscriptions. It covers the entire deal lifecycle:

```
Lead → Quotation Builder → Risk Scoring → Approval Workflow
  → Customer Negotiation → Fulfillment → Billing → Analytics
```

The platform serves **five distinct user roles** — Sales Reps, Sales Managers, Finance, Admins, and Customers — each with a tailored experience and appropriate access controls. It includes a powerful **Backend Admin** panel for configuring products, discount policies, warehouses, subscription plans, and upsell rules.

---

## ✨ Key Features

### 🧾 Quotation Builder
- Drag-and-drop line item management with live totals
- Per-line discount, tax, and subscription plan assignment
- Product variant support (e.g., color, spec, size)
- Real-time **Blended Risk Score** calculation (0–100)
- Upsell suggestions powered by configurable rule engine
- Quote reference generation, expiry dates, and notes

### ✅ Multi-Level Approval Workflow
- Tiered approval: `Sales Rep → Sales Manager → Finance`
- Auto-triggered based on blended risk score thresholds
- Comment threads per approval step
- Quote returned/rejected with reasons
- Full audit trail on every status change

### 🤝 Customer Negotiation Portal
- Shareable, tokenized portal link per quotation
- Customers can view line items and submit counter-proposals
- Sales reps accept/reject negotiations from the workspace
- Real-time negotiation thread with timestamps

### 📦 Smart Warehouse Fulfillment
- Priority-based multi-warehouse stock allocation algorithm
- Automatically splits shipments across warehouses
- Backorder flagging for out-of-stock items
- Shipping cost aggregation per fulfillment split

### 💳 Billing & Proration Engine
- Separates one-time vs. recurring line billing
- Generates multi-cycle billing schedules (monthly/quarterly/yearly)
- Day-accurate proration calculation on plan changes or cancellations
- Visual billing timeline with status badges (Scheduled / Invoiced / Paid)

### 📊 Deal Health Dashboard
- Real-time KPI cards: Revenue, Active Quotes, Win Rate, Avg Deal Size
- Automated deal alerts: stalled deals, discount anomalies, approval delays, delivery slippage
- Alert severity levels (Low / Medium / High) with acknowledgment
- Pipeline funnel view across all quotation statuses

### 🗂️ Pipeline View
- Kanban-style visual deal pipeline
- Drag-and-drop between status columns
- Quick-view cards with deal value, customer, and assigned rep

### 🔧 Backend Admin Panel
- **Products**: CRUD for hardware, software, services, subscriptions with variants
- **Discount Tiers**: Per-tier global and per-category discount ceilings with approval thresholds
- **Warehouses**: Stock levels, reservations, shipping costs, and priority configuration
- **Subscription Plans**: Billing cycles, product bundles, proration and cancellation policies
- **Upsell Rules**: Trigger-product → suggested-product rules with margin delta logic
- **Reporting**: Revenue, deal volume, and team performance analytics with Recharts

### 🔐 Authentication & Role-Based Access
- Email/password login with session persistence (Zustand + LocalStorage)
- One-click demo login for each role
- Protected routes with redirect to login
- Role-aware UI: menus, actions, and pages adapt per role

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 + TypeScript 6 |
| **Build Tool** | Vite 8 |
| **Routing** | React Router DOM v7 |
| **State Management** | Zustand v5 (with persistence middleware) |
| **Data Fetching** | TanStack React Query v5 |
| **Styling** | Tailwind CSS v4 |
| **UI Components** | Radix UI Primitives (Dialog, Tabs, Select, Slider, Switch, etc.) |
| **Animations** | Framer Motion v13 |
| **Charts** | Recharts v3 |
| **Forms** | React Hook Form v7 + Zod v3 (schema validation) |
| **Date Utilities** | date-fns v4 |
| **Icons** | Lucide React |
| **Toasts/Notifications** | Sonner v2 |
| **Linting** | OXLint |
| **Package Manager** | npm |

---

## 🏗️ Project Architecture

```
dealflow360/
├── public/                   # Static assets (favicon, icons)
├── src/
│   ├── assets/               # Images and SVGs
│   ├── components/           # Shared & layout components
│   │   ├── layout/           # AppShell, Sidebar, TopNav
│   │   └── shared/           # Reusable UI components
│   ├── data/
│   │   └── seed.ts           # Demo data (users, products, customers, warehouses, etc.)
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Core business logic utilities
│   │   ├── blendedRiskScore.ts   # Risk scoring + quote math
│   │   ├── warehouseSplit.ts     # Fulfillment allocation algorithm
│   │   └── billingProration.ts  # Billing schedule + proration engine
│   ├── pages/                # Route-level page components
│   │   ├── auth/             # Login, Signup
│   │   ├── workspace/        # Quotation list, builder, approval, fulfillment, billing, pipeline
│   │   ├── dashboard/        # Deal Health KPI dashboard
│   │   ├── portal/           # Customer-facing quotation portal
│   │   └── backend/          # Admin panel (products, discounts, warehouses, subscriptions, upsell, reporting)
│   ├── router/
│   │   └── index.tsx         # All application routes (protected + public)
│   ├── stores/
│   │   ├── authStore.ts      # Authentication state (Zustand)
│   │   └── quotationStore.ts # Quotation CRUD state (Zustand)
│   ├── types/
│   │   └── index.ts          # All TypeScript interfaces and types
│   ├── App.tsx               # App root
│   ├── main.tsx              # ReactDOM entry point
│   └── index.css             # Global styles + Tailwind directives
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 📄 Pages & Modules

### Auth
| Route | Page | Description |
|---|---|---|
| `/login` | `LoginPage` | Email/password login + role-based demo login buttons |
| `/signup` | `SignupPage` | New account registration |

### Workspace (Protected)
| Route | Page | Description |
|---|---|---|
| `/workspace` | `WorkspacePage` | Personal dashboard — recent quotes, quick actions |
| `/quotations` | `QuotationListPage` | Searchable, filterable list of all quotations |
| `/quotations/:id` | `QuotationBuilderPage` | Full quotation editor with risk score + upsell panel |
| `/quotations/:id/approval` | `ApprovalPage` | Multi-step approval workflow with comments |
| `/quotations/:id/fulfillment` | `FulfillmentPage` | Warehouse allocation and shipment planning |
| `/quotations/:id/billing` | `BillingPage` | Billing schedule viewer and proration summary |
| `/pipeline` | `PipelinePage` | Kanban pipeline across all deal stages |
| `/deal-health` | `DealHealthPage` | KPI cards, alerts, and deal monitoring |

### Customer Portal
| Route | Page | Description |
|---|---|---|
| `/portal/:quoteId` | `CustomerPortalPage` | Read-only quote view + negotiation submission for customers |

### Backend Admin
| Route | Page | Description |
|---|---|---|
| `/backend/products` | `ProductsPage` | Full CRUD product catalog management |
| `/backend/discount-tiers` | `DiscountTiersPage` | Configure per-tier discount ceilings + approval thresholds |
| `/backend/warehouses` | `WarehousesPage` | Warehouse inventory and shipping setup |
| `/backend/subscriptions` | `SubscriptionPlansPage` | Subscription plan configuration |
| `/backend/upsell-rules` | `UpsellRulesPage` | Upsell trigger rules with margin tracking |
| `/backend/reporting` | `ReportingPage` | Revenue charts, deal volume, and performance analytics |

---

## 👥 User Roles & Permissions

| Role | Key Permissions |
|---|---|
| `sales_rep` | Create/edit quotations, view pipeline, submit for approval |
| `sales_manager` | All sales rep permissions + approve/reject quotes at manager level |
| `finance` | Final approval authority, access to billing & financial reporting |
| `admin` | Full access to all pages including Backend Admin panel |
| `customer` | Access only to their shareable Customer Portal quote link |

---

## ⚙️ Core Business Logic

### 1. Blended Risk Score (`src/lib/blendedRiskScore.ts`)

Calculates a **0–100 risk score** for a quotation based on how far each line-item discount exceeds the configured ceiling for that product category and customer tier.

- **Weighted by line value**: Higher-value lines with deeper discounts contribute more to the risk score.
- **Auto-triggers approvals**: If the score exceeds `requiresManagerAbove`, a Sales Manager approval step is added. If it exceeds `requiresFinanceAbove`, Finance approval is also required.
- Provides per-line breakdown (overage, ceiling, given discount) for transparency.

```
blendedOverage = Σ(overage × lineTotal) / Σ(lineTotal)
score = min(100, round((blendedOverage / avgCeiling) × 100))
```

### 2. Warehouse Split Algorithm (`src/lib/warehouseSplit.ts`)

Intelligently allocates fulfillment across multiple warehouses using a **priority-first greedy algorithm**:

1. Sort warehouses by `priority` (ascending)
2. For each order line, fill from highest-priority warehouse first
3. Spill into secondary warehouses if stock is insufficient
4. Any unmet quantity is flagged as **Backorder**
5. Recurring/subscription products are excluded (they don't ship)

### 3. Billing & Proration Engine (`src/lib/billingProration.ts`)

Generates a complete billing schedule separating one-time and recurring charges:

- **One-time lines** (hardware, services): Billed once on the deal start date
- **Recurring lines** (subscriptions): Generate N billing entries based on cycle (monthly / quarterly / yearly)
- **Proration**: Calculates the exact credit/charge amount for mid-cycle plan changes using day-accurate math

---

## 📐 Data Model

Key TypeScript interfaces from `src/types/index.ts`:

```typescript
// Core entities
User         → id, name, email, role (UserRole), team, avatar
Customer     → id, name, email, tier (CustomerTier), company, currency
Product      → id, name, category, type (one_time | recurring), price, stock, variants[]

// Quotation lifecycle
Quotation    → id, reference, customer, assignedTo, status (QuotationStatus),
               lines[], approvalSteps[], auditTrail[], negotiationRequests[],
               fulfillmentLines[], billingSchedule[], blendedRiskScore

QuotationLine     → product, quantity, unitPrice, discount, tax, subscriptionPlanId
ApprovalStep      → level, role, approverName, status, comment, timestamp
AuditEntry        → userId, action, timestamp, reason
NegotiationRequest → message, counterDiscount, status

// Configuration
DiscountTier     → tier, globalMax, categoryCeilings[], requiresManagerAbove, requiresFinanceAbove
Warehouse        → name, location, shippingCost, priority, stock[]
SubscriptionPlan → name, cycle (BillingCycle), productIds[], prorateOnChange
UpsellRule       → triggerProductId, suggestedProductId, reason, marginDelta
```

**Quotation Status Flow:**
```
Draft → Pending Approval → Approved / Rejected
     ↘ Under Negotiation ↗
Approved → Confirmed → Fulfillment → Billed
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or later
- **npm** v9 or later

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/OH2026-Round-2-830.git
cd OH2026-Round-2-830/dealflow360

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will be available at **http://localhost:5173**

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

---

## 🔑 Demo Accounts

Use these credentials on the Login page, or click the **"Demo Login"** buttons for one-click access:

| Role | Email | Password |
|---|---|---|
| Sales Rep | `alex@dealflow360.com` | `rep123` |
| Sales Manager | `sarah@dealflow360.com` | `manager123` |
| Finance | `mike@dealflow360.com` | `finance123` |
| Admin | `admin@dealflow360.com` | `admin123` |
| Sales Rep (East) | `jordan@dealflow360.com` | `rep123` |
| **Customer** | `james@acmecorp.com` | `customer123` |
| **Customer** | `omar@gammatech.com` | `customer123` |

> **Note:** Customer accounts access the portal via `/portal/:quoteId` — not the main workspace.

---

## 🔧 Environment & Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | TypeScript compile + Vite production build |
| `npm run preview` | Preview the production bundle locally |
| `npm run lint` | Run OXLint for code quality checks |

> **No environment variables required** — the app uses in-memory seeded data for demo purposes. In a production setup, replace `src/data/seed.ts` with actual API calls.

---

## 💡 Future Improvements

| Area | Improvement |
|---|---|
| **Backend Integration** | Connect to a REST/GraphQL API (e.g., Node.js + PostgreSQL) replacing seed data |
| **Real-time Updates** | WebSocket/SSE for live approval notifications and deal alerts |
| **PDF Export** | Generate professional PDF quotations for customer delivery |
| **Email Integration** | Auto-email customers when quotes are shared, approved, or updated |
| **CRM Sync** | Salesforce / HubSpot integration for lead-to-quote automation |
| **Advanced Analytics** | Predictive win-rate scoring using ML on historical deal data |
| **Multi-currency** | Live FX rates and per-customer currency display |
| **Mobile App** | React Native companion app for on-the-go approvals |
| **E-Signature** | DocuSign / Adobe Sign integration for contract finalization |
| **Tenant Management** | Multi-tenancy support for SaaS deployment with isolated data per org |

---

## 📝 License

This project was developed for **OH2026 Round 2** (Team 830). All rights reserved.

---

<div align="center">
  <strong>DealFlow360</strong> — Built with React, TypeScript, Vite & Tailwind CSS
</div>
