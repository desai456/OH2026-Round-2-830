import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';

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
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="quotes" element={<QuotationList />} />
            <Route path="quotes/:id" element={<QuotationBuilder />} />
            <Route path="approvals" element={<ApprovalsList />} />
            <Route path="fulfillment" element={<Fulfillment />} />
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
            <Route path="admin/rules" element={<AdminRules />} />
            <Route path="admin/products" element={<ProductCatalog />} />
            
            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
          
          <Route path="/customer/portal" element={<CustomerPortal />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}


