import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Quote, QuoteLine, Invoice, ToastMessage, UserRole, QuoteStatus } from '../types';
import { USERS, INITIAL_QUOTES, INITIAL_INVOICES } from '../data/mockData';
import { calculateQuoteMetrics, QuoteCalculations } from '../utils/calculations';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  quotes: Quote[];
  invoices: Invoice[];
  selectedQuoteId: string;
  setSelectedQuoteId: (id: string) => void;
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  // Quote Operations
  updateQuote: (quoteId: string, updates: Partial<Quote>) => void;
  updateQuoteLine: (quoteId: string, lineId: string, updates: Partial<QuoteLine>) => void;
  addQuoteLine: (quoteId: string, line: Omit<QuoteLine, 'id'>) => void;
  removeQuoteLine: (quoteId: string, lineId: string) => void;
  submitForApproval: (quoteId: string) => void;
  approveQuote: (quoteId: string, comment?: string) => void;
  rejectQuote: (quoteId: string, reason: string) => void;
  requestRevision: (quoteId: string, note: string) => void;
  submitCustomerCounterOffer: (quoteId: string, requestedDiscountPercent: number, reason: string) => void;
  confirmQuote: (quoteId: string) => void;
  generateInvoiceFromQuote: (quoteId: string) => Invoice;
  recordPayment: (invoiceId: string) => void;
  createQuote: (customerId: string, opportunity?: string) => Quote;
  getQuoteMetrics: (quote: Quote) => QuoteCalculations;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(USERS[0]);
  const [quotes, setQuotes] = useState<Quote[]>(INITIAL_QUOTES);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>('q-1042');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('dealflow360_theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('dealflow360_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const switchRole = (role: UserRole) => {
    const targetUser = USERS.find(u => u.role === role) || {
      id: `u-custom-${role.toLowerCase()}`,
      name: `${role} Demo User`,
      role: role,
      email: `${role.toLowerCase().replace(' ', '.')}@dealflow360.io`,
    };
    setCurrentUser(targetUser);
    addToast({
      type: 'info',
      title: 'Role Switched',
      message: `Navigated to view as ${role} (${targetUser.name}).`,
    });
  };

  const getQuoteMetrics = (quote: Quote) => {
    return calculateQuoteMetrics(quote);
  };

  const updateQuote = (quoteId: string, updates: Partial<Quote>) => {
    setQuotes(prev =>
      prev.map(q => {
        if (q.id !== quoteId) return q;
        const updated = { ...q, ...updates, updatedAt: new Date().toISOString() };
        return updated;
      })
    );
  };

  const updateQuoteLine = (quoteId: string, lineId: string, updates: Partial<QuoteLine>) => {
    setQuotes(prev =>
      prev.map(q => {
        if (q.id !== quoteId) return q;

        const newLines = q.lines.map(l => (l.id === lineId ? { ...l, ...updates } : l));
        const tempQuote = { ...q, lines: newLines };
        const metrics = calculateQuoteMetrics(tempQuote);

        let newStatus = q.status;
        if (q.status === 'Approved' && metrics.riskLevel === 'HIGH') {
          newStatus = 'Pending Approval';
        }

        const activityMsg = updates.discountPercent !== undefined
          ? `Discount updated on line item. Risk re-evaluated: ${metrics.riskLevel} (${metrics.riskScore}/100).`
          : `Line item quantity / configuration updated. Total contract value: $${metrics.contractValue.toLocaleString()}.`;

        const newActivity = {
          id: Math.random().toString(36).substring(7),
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          user: currentUser.name,
          role: currentUser.role,
          action: 'Line Item Modified',
          details: activityMsg,
        };

        return {
          ...q,
          lines: newLines,
          status: newStatus,
          updatedAt: new Date().toISOString(),
          activities: [newActivity, ...q.activities],
        };
      })
    );

    addToast({
      type: 'success',
      title: 'Quote Line Updated',
      message: 'Recalculated total, margins, and discount risk in real time.',
    });
  };

  const addQuoteLine = (quoteId: string, line: Omit<QuoteLine, 'id'>) => {
    const newLineId = Math.random().toString(36).substring(7);
    setQuotes(prev =>
      prev.map(q => {
        if (q.id !== quoteId) return q;
        const newLines = [...q.lines, { ...line, id: newLineId }];
        const newActivity = {
          id: Math.random().toString(36).substring(7),
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          user: currentUser.name,
          role: currentUser.role,
          action: 'Product Added',
          details: `Added new line item to quotation.`,
        };
        return {
          ...q,
          lines: newLines,
          updatedAt: new Date().toISOString(),
          activities: [newActivity, ...q.activities],
        };
      })
    );

    addToast({
      type: 'success',
      title: 'Product Added',
      message: 'Added product to quotation line editor.',
    });
  };

  const removeQuoteLine = (quoteId: string, lineId: string) => {
    setQuotes(prev =>
      prev.map(q => {
        if (q.id !== quoteId) return q;
        return {
          ...q,
          lines: q.lines.filter(l => l.id !== lineId),
          updatedAt: new Date().toISOString(),
        };
      })
    );

    addToast({
      type: 'warning',
      title: 'Item Removed',
      message: 'Removed item from quotation.',
    });
  };

  const submitForApproval = (quoteId: string) => {
    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) return;

    const metrics = calculateQuoteMetrics(quote);
    const approvalSteps: import('../types').ApprovalStep[] = [
      {
        id: Math.random().toString(36).substring(7),
        role: 'Sales Rep' as UserRole,
        name: currentUser.name,
        status: 'Approved',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        comment: 'Submitted quote for self-governing approval review.',
      },
      {
        id: Math.random().toString(36).substring(7),
        role: 'Sales Manager' as UserRole,
        name: 'Sarah Vance',
        status: 'Pending',
        timestamp: undefined,
        comment: undefined,
      },
    ];

    if (metrics.requiresFinance) {
      approvalSteps.push({
        id: Math.random().toString(36).substring(7),
        role: 'Finance' as UserRole,
        name: 'Michael Sterling',
        status: 'Waiting',
        timestamp: undefined,
        comment: undefined,
      });
    }

    const activity = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      user: currentUser.name,
      role: currentUser.role,
      action: 'Approval Requested',
      details: `Quote submitted for approval. Risk: ${metrics.riskLevel} (${metrics.riskScore}/100).`,
    };

    updateQuote(quoteId, {
      status: 'Pending Approval',
      approvalHistory: approvalSteps,
      activities: [activity, ...quote.activities],
    });

    addToast({
      type: 'info',
      title: 'Approval Submitted',
      message: `Triggered approval chain for Sales Manager ${metrics.requiresFinance ? '& Finance' : ''}.`,
    });
  };

  const approveQuote = (quoteId: string, comment?: string) => {
    setQuotes(prev =>
      prev.map(q => {
        if (q.id !== quoteId) return q;

        const currentStepIndex = q.approvalHistory.findIndex(step => step.role === currentUser.role && step.status === 'Pending');
        let newHistory = [...q.approvalHistory];

        if (currentStepIndex !== -1) {
          newHistory[currentStepIndex] = {
            ...newHistory[currentStepIndex],
            status: 'Approved',
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            comment: comment || `Approved by ${currentUser.role}`,
          };

          if (currentStepIndex + 1 < newHistory.length) {
            newHistory[currentStepIndex + 1] = {
              ...newHistory[currentStepIndex + 1],
              status: 'Pending',
            };
          }
        }

        const isFullyApproved = newHistory.every(step => step.status === 'Approved');
        const newStatus: QuoteStatus = isFullyApproved ? 'Approved' : 'Pending Approval';

        const activity = {
          id: Math.random().toString(36).substring(7),
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          user: currentUser.name,
          role: currentUser.role,
          action: isFullyApproved ? 'Final Approval Granted' : 'Intermediate Step Approved',
          details: comment || `${currentUser.role} approved quotation step.`,
        };

        return {
          ...q,
          status: newStatus,
          approvalHistory: newHistory,
          activities: [activity, ...q.activities],
        };
      })
    );

    addToast({
      type: 'success',
      title: 'Approved',
      message: `Quotation step approved by ${currentUser.role}.`,
    });
  };

  const rejectQuote = (quoteId: string, reason: string) => {
    setQuotes(prev =>
      prev.map(q => {
        if (q.id !== quoteId) return q;

        const newHistory = q.approvalHistory.map(step =>
          step.role === currentUser.role ? { ...step, status: 'Rejected' as const, comment: reason } : step
        );

        const activity = {
          id: Math.random().toString(36).substring(7),
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          user: currentUser.name,
          role: currentUser.role,
          action: 'Quote Rejected',
          details: `Rejection reason: ${reason}`,
        };

        return {
          ...q,
          status: 'Rejected',
          rejectionReason: reason,
          approvalHistory: newHistory,
          activities: [activity, ...q.activities],
        };
      })
    );

    addToast({
      type: 'error',
      title: 'Quotation Rejected',
      message: `Quotation rejected. Reason logged in audit history.`,
    });
  };

  const requestRevision = (quoteId: string, note: string) => {
    setQuotes(prev =>
      prev.map(q => {
        if (q.id !== quoteId) return q;

        const newHistory = q.approvalHistory.map(step =>
          step.role === currentUser.role ? { ...step, status: 'Revision Requested' as const, comment: note } : step
        );

        const activity = {
          id: Math.random().toString(36).substring(7),
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          user: currentUser.name,
          role: currentUser.role,
          action: 'Revision Requested',
          details: `Requested revisions: ${note}`,
        };

        return {
          ...q,
          status: 'Under Negotiation',
          revisionNote: note,
          approvalHistory: newHistory,
          activities: [activity, ...q.activities],
        };
      })
    );

    addToast({
      type: 'warning',
      title: 'Revision Requested',
      message: 'Returned quotation to rep for price adjustment.',
    });
  };

  const submitCustomerCounterOffer = (quoteId: string, requestedDiscountPercent: number, reason: string) => {
    setQuotes(prev =>
      prev.map(q => {
        if (q.id !== quoteId) return q;

        const updatedLines = q.lines.map(line => ({
          ...line,
          discountPercent: requestedDiscountPercent,
        }));

        const tempQuote = { ...q, lines: updatedLines };
        const metrics = calculateQuoteMetrics(tempQuote);

        const approvalSteps: import('../types').ApprovalStep[] = [
          {
            id: Math.random().toString(36).substring(7),
            role: 'Customer' as UserRole,
            name: 'Marcus Brody (Acme Corp)',
            status: 'Approved',
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            comment: `Customer requested counter discount of ${requestedDiscountPercent}%. Reason: ${reason}`,
          },
          {
            id: Math.random().toString(36).substring(7),
            role: 'Sales Manager' as UserRole,
            name: 'Sarah Vance',
            status: 'Pending',
          },
          {
            id: Math.random().toString(36).substring(7),
            role: 'Finance' as UserRole,
            name: 'Michael Sterling',
            status: 'Waiting',
          },
        ];

        const activity = {
          id: Math.random().toString(36).substring(7),
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          user: 'Marcus Brody',
          role: 'Customer' as UserRole,
          action: 'Customer Counter-Offer Submitted',
          details: `Requested ${requestedDiscountPercent}% global discount. Reason: ${reason}. Risk elevated to ${metrics.riskLevel} (${metrics.riskScore}/100).`,
        };

        return {
          ...q,
          lines: updatedLines,
          status: 'Pending Approval',
          customerCounterOffer: {
            requestedDiscountPercent,
            reason,
            requestedAt: new Date().toISOString(),
          },
          approvalHistory: approvalSteps,
          activities: [activity, ...q.activities],
        };
      })
    );

    addToast({
      type: 'info',
      title: 'Counter-Offer Submitted',
      message: `Your request for ${requestedDiscountPercent}% discount was sent for sales governance review.`,
    });
  };

  const confirmQuote = (quoteId: string) => {
    setQuotes(prev =>
      prev.map(q => {
        if (q.id !== quoteId) return q;
        const activity = {
          id: Math.random().toString(36).substring(7),
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          user: currentUser.name,
          role: currentUser.role,
          action: 'Quote Confirmed',
          details: 'Quotation confirmed by customer. Ready for warehouse fulfillment.',
        };
        return {
          ...q,
          status: 'Confirmed',
          activities: [activity, ...q.activities],
        };
      })
    );

    addToast({
      type: 'success',
      title: 'Quote Confirmed',
      message: 'Deal confirmed and locked for fulfillment.',
    });
  };

  const generateInvoiceFromQuote = (quoteId: string): Invoice => {
    const quote = quotes.find(q => q.id === quoteId) || quotes[0];
    const metrics = calculateQuoteMetrics(quote);

    const invoiceNumber = `INV-${quote.quoteNumber.replace('Q-', '')}`;
    const newInvoice: Invoice = {
      id: Math.random().toString(36).substring(7),
      invoiceNumber,
      quoteId: quote.id,
      quoteNumber: quote.quoteNumber,
      customerId: quote.customerId,
      customerName: 'Acme Corp',
      issueDate: new Date().toISOString().substring(0, 10),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
      amount: Math.round(metrics.contractValue),
      status: 'Sent',
      lines: metrics.lineDetails.map(l => ({
        id: Math.random().toString(36).substring(7),
        description: `${l.product.name} (Qty: ${l.qty})`,
        qty: l.qty,
        unitPrice: Math.round(l.unitPriceWithConfig * (1 - l.discountPercent / 100)),
        total: Math.round(l.finalLineTotal),
      })),
      paymentTimeline: [],
    };

    setInvoices(prev => [newInvoice, ...prev]);
    updateQuote(quoteId, { status: 'Invoiced' });

    addToast({
      type: 'success',
      title: 'Invoice Generated',
      message: `Issued invoice ${invoiceNumber} for $${metrics.contractValue.toLocaleString()}.`,
    });

    return newInvoice;
  };

  const recordPayment = (invoiceId: string) => {
    setInvoices(prev =>
      prev.map(inv => {
        if (inv.id !== invoiceId) return inv;
        const updated = {
          ...inv,
          status: 'Paid' as const,
          paymentTimeline: [
            ...(inv.paymentTimeline || []),
            {
              date: new Date().toISOString().substring(0, 10),
              amount: inv.amount,
              method: 'Enterprise ACH / Wire',
            },
          ],
        };
        updateQuote(inv.quoteId, { status: 'Paid' });
        return updated;
      })
    );

    addToast({
      type: 'success',
      title: 'Payment Recorded',
      message: 'Full payment cleared. Deal status set to Paid!',
    });
  };

  const createQuote = (customerId: string, opportunity?: string): Quote => {
    const newId = `q-${Math.floor(1000 + Math.random() * 9000)}`;
    const newQuoteNum = `Q-${Math.floor(1000 + Math.random() * 9000)}`;

    const newQuote: Quote = {
      id: newId,
      quoteNumber: newQuoteNum,
      customerId,
      opportunity: opportunity || 'New Business Expansion',
      priceBook: 'Enterprise US',
      owner: currentUser.name,
      currency: 'USD',
      status: 'Draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lines: [
        {
          id: Math.random().toString(36).substring(7),
          productId: 'p1',
          qty: 1,
          unitPrice: 8000,
          discountPercent: 0,
          taxPercent: 5,
        },
      ],
      approvalHistory: [],
      activities: [
        {
          id: Math.random().toString(36).substring(7),
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          user: currentUser.name,
          role: currentUser.role,
          action: 'Quote Created',
          details: `Initialized quote ${newQuoteNum}.`,
        },
      ],
    };

    setQuotes(prev => [newQuote, ...prev]);
    setSelectedQuoteId(newId);

    addToast({
      type: 'success',
      title: 'Quotation Created',
      message: `Created new draft ${newQuoteNum}.`,
    });

    return newQuote;
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        theme,
        toggleTheme,
        quotes,
        invoices,
        selectedQuoteId,
        setSelectedQuoteId,
        toasts,
        addToast,
        removeToast,
        updateQuote,
        updateQuoteLine,
        addQuoteLine,
        removeQuoteLine,
        submitForApproval,
        approveQuote,
        rejectQuote,
        requestRevision,
        submitCustomerCounterOffer,
        confirmQuote,
        generateInvoiceFromQuote,
        recordPayment,
        createQuote,
        getQuoteMetrics,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
