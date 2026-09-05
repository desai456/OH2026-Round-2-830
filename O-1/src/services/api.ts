/**
 * DealFlow360 API Service
 * Interfacing React frontend with Python FastAPI backend (http://localhost:8000/api)
 */

const API_BASE_URL = 'http://localhost:8000/api';

export async function fetchFromAPI(endpoint: string, options: RequestInit = {}) {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    if (!res.ok) {
      throw new Error(`API Error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`[DealFlow360 API] Backend request failed (${endpoint}), falling back to local state.`, err);
    return null;
  }
}

export const api = {
  // Auth
  login: (data: any) => fetchFromAPI('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getCurrentUser: () => fetchFromAPI('/auth/me'),

  // Products
  getProducts: (category?: string) => fetchFromAPI(`/products${category ? `?category=${category}` : ''}`),
  getDiscountTiers: () => fetchFromAPI('/products/discount-tiers'),

  // Quotations & Governance
  getQuotations: (status?: string) => fetchFromAPI(`/quotations${status ? `?status=${status}` : ''}`),
  getQuotation: (id: string) => fetchFromAPI(`/quotations/${id}`),
  createQuotation: (data: any) => fetchFromAPI('/quotations/', { method: 'POST', body: JSON.stringify(data) }),
  getUpsellRecommendations: (id: string) => fetchFromAPI(`/quotations/${id}/upsell-recommendations`, { method: 'POST' }),

  // Approvals
  getApprovals: () => fetchFromAPI('/approvals/'),
  actOnApproval: (data: any) => fetchFromAPI('/approvals/act', { method: 'POST', body: JSON.stringify(data) }),

  // Warehouses & Fulfillment
  getWarehouses: () => fetchFromAPI('/warehouses/'),
  getFulfillmentSplitRecommendation: (quoteId: string) => fetchFromAPI(`/warehouses/split-recommendation/${quoteId}`),

  // Subscriptions & Billing
  getSubscriptions: () => fetchFromAPI('/subscriptions/'),
  getHybridSchedule: (quoteId: string) => fetchFromAPI(`/subscriptions/hybrid-schedule/${quoteId}`),
  checkProration: (currentMrr: number, newMrr: number, daysRemaining: number = 15) =>
    fetchFromAPI(`/subscriptions/proration-check?current_mrr=${currentMrr}&new_mrr=${newMrr}&days_remaining=${daysRemaining}`, { method: 'POST' }),

  // Customer Portal Negotiation
  getPortalQuotation: (quoteId: string) => fetchFromAPI(`/portal/quotation/${quoteId}`),
  submitNegotiation: (data: any) => fetchFromAPI('/portal/negotiate', { method: 'POST', body: JSON.stringify(data) }),

  // Deal Health Alerts
  getDealHealthAlerts: () => fetchFromAPI('/health/'),
  triggerNudge: (alertId: string) => fetchFromAPI(`/health/trigger-nudge/${alertId}`, { method: 'POST' }),

  // Reports
  getReportingSummary: (period: string = 'All', rep: string = 'All', status: string = 'All') =>
    fetchFromAPI(`/reports/summary?period=${period}&sales_rep=${rep}&approval_status=${status}`),
};
