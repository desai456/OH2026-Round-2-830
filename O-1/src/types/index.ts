export type UserRole = 'Sales Rep' | 'Sales Manager' | 'Finance' | 'Operations' | 'Admin' | 'Customer';

export type CustomerTier = 'Bronze' | 'Silver' | 'Gold';

export type QuoteStatus = 
  | 'Draft' 
  | 'Sent' 
  | 'Under Negotiation' 
  | 'Pending Approval' 
  | 'Approved' 
  | 'Confirmed' 
  | 'Fulfillment' 
  | 'Invoiced' 
  | 'Paid' 
  | 'Rejected';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type ProductCategory = 'Hardware' | 'Service' | 'Subscription';

export type UnitType = 'Each' | 'Month' | 'Year' | 'User';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  basePrice: number;
  cost: number;
  unit: UnitType;
  description: string;
  isConfigurable?: boolean;
  options?: {
    ram?: string[];
    storage?: string[];
    warranty?: string[];
  };
  recommendations?: string[]; // Product IDs of upsell/cross-sell
}

export interface Customer {
  id: string;
  name: string;
  tier: CustomerTier;
  accountManager: string;
  opportunity: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
}

export interface QuoteLine {
  id: string;
  productId: string;
  qty: number;
  unitPrice: number;
  discountPercent: number;
  taxPercent: number;
  selectedRam?: string;
  selectedStorage?: string;
  selectedWarranty?: string;
  configAdjustment?: number;
}

export interface RiskFactor {
  id: string;
  title: string;
  severity: 'warning' | 'danger' | 'info';
  message: string;
  points: number;
}

export interface ApprovalStep {
  id: string;
  role: UserRole;
  name: string;
  status: 'Approved' | 'Pending' | 'Waiting' | 'Rejected' | 'Revision Requested';
  timestamp?: string;
  comment?: string;
}

export interface ApprovalRule {
  id: string;
  name: string;
  condition: string;
  requiredRole: UserRole;
  triggered: boolean;
}

export interface ActivityItem {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  details: string;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  customerId: string;
  opportunity: string;
  priceBook: string;
  owner: string;
  currency: string;
  status: QuoteStatus;
  lines: QuoteLine[];
  createdAt: string;
  updatedAt: string;
  approvalHistory: ApprovalStep[];
  activities: ActivityItem[];
  customerNote?: string;
  rejectionReason?: string;
  revisionNote?: string;
  customerCounterOffer?: {
    requestedDiscountPercent: number;
    reason: string;
    requestedAt: string;
  };
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  location: string;
  availableStock: Record<string, number>;
  reservedStock: Record<string, number>;
}

export interface WarehouseAllocation {
  warehouseId: string;
  warehouseName: string;
  productId: string;
  allocatedQty: number;
  shippingCost: number;
}

export interface InvoiceLine {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  quoteId: string;
  quoteNumber: string;
  customerId: string;
  customerName: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  status: 'Draft' | 'Sent' | 'Partially Paid' | 'Paid' | 'Overdue';
  lines: InvoiceLine[];
  paymentTimeline?: { date: string; amount: number; method: string }[];
}

export interface PriceBook {
  id: string;
  name: string;
  currency: string;
  effectiveDate: string;
  description: string;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatar?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}
