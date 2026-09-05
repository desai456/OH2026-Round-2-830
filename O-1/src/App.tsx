import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import DealHealth from './pages/dashboard/DealHealth';
import ReportsDashboard from './pages/reports/ReportsDashboard';
import QuotationList from './pages/quotations/QuotationList';
import QuotationBuilder from './pages/quotations/QuotationBuilder';
import ApprovalsList from './pages/quotations/ApprovalsList';
import Fulfillment from './pages/quotations/Fulfillment';
import Billing from './pages/quotations/Billing';
import SubscriptionsList from './pages/subscriptions/SubscriptionsList';
import InvoiceList from './pages/invoices/InvoiceList';
import InvoiceDetail from './pages/invoices/InvoiceDetail';
import ProductCatalog from './pages/products/ProductCatalog';
import ProductDetail from './pages/products/ProductDetail';
import CustomerPortal from './pages/customer/CustomerPortal';
import AdminRules from './pages/admin/AdminRules';

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <Routes>
            {/* Public: Login/Signup */}
            <Route path="/login" element={<Login />} />

            {/* Customer Portal (accessible to Customer role) */}
            <Route
              path="/customer/portal"
              element={
                <ProtectedRoute allowedRoles={['Customer', 'Admin', 'Sales Rep', 'Sales Manager', 'Finance', 'Operations']}>
                  <CustomerPortal />
                </ProtectedRoute>
              }
            />

            {/* Internal App Routes (wrapped in AppLayout) */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="quotes" element={<QuotationList />} />
              <Route path="quotes/:id" element={<QuotationBuilder />} />

              {/* Approvals: Accessible to all authenticated team members */}
              <Route
                path="approvals"
                element={
                  <ProtectedRoute>
                    <ApprovalsList />
                  </ProtectedRoute>
                }
              />

              {/* Fulfillment: Accessible to all authenticated team members */}
              <Route
                path="fulfillment"
                element={
                  <ProtectedRoute>
                    <Fulfillment />
                  </ProtectedRoute>
                }
              />
              <Route path="fulfillment/:id" element={<Fulfillment />} />

              <Route path="subscriptions" element={<SubscriptionsList />} />
              <Route path="billing/:id" element={<Billing />} />

              <Route path="invoices" element={<InvoiceList />} />
              <Route path="invoices/:id" element={<InvoiceDetail />} />

              <Route path="health" element={<DealHealth />} />

              <Route path="reports" element={<ReportsDashboard />} />
              <Route path="analytics" element={<ReportsDashboard />} />

              <Route path="products" element={<ProductCatalog />} />
              <Route path="products/new" element={<ProductDetail />} />
              <Route path="products/:id" element={<ProductDetail />} />

              {/* Admin-only routes */}
              <Route
                path="admin/rules"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <AdminRules />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/products"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'Sales Manager']}>
                    <ProductCatalog />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}
