import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';

import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import DealHealth from './pages/dashboard/DealHealth';
import Analytics from './pages/analytics/Analytics';
import QuotationList from './pages/quotations/QuotationList';
import QuotationBuilder from './pages/quotations/QuotationBuilder';
import ApprovalsList from './pages/quotations/ApprovalsList';
import Fulfillment from './pages/quotations/Fulfillment';
import Billing from './pages/quotations/Billing';
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
            <Route path="health" element={<DealHealth />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="quotes" element={<QuotationList />} />
            <Route path="quotes/:id" element={<QuotationBuilder />} />
            <Route path="approvals" element={<ApprovalsList />} />
            <Route path="fulfillment/:id" element={<Fulfillment />} />
            <Route path="billing/:id" element={<Billing />} />
            <Route path="admin/rules" element={<AdminRules />} />
            <Route path="admin/products" element={<AdminRules />} />
            
            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
          
          <Route path="/customer/portal" element={<CustomerPortal />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}
