import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, DollarSign, CheckCircle2, Building, Calendar, CreditCard, ShieldCheck, FileText } from 'lucide-react';
import { Badge, Button, Card, DetailBanner, HorizontalStepper } from '../../components/ui';

export default function InvoiceDetail() {
  const { id = 'INV-2026-089' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [paymentRecorded, setPaymentRecorded] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('77250');

  const invoiceData = {
    id,
    customer: 'Acme Corp',
    contact: 'Jane Doe (jane.doe@acme.com)',
    quoteRef: 'QT-2026-1049',
    issueDate: '2026-08-30',
    dueDate: '2026-09-30',
    totalAmount: 154500,
    paidAmount: paymentRecorded ? 154500 : 77250,
    remainingBalance: paymentRecorded ? 0 : 77250,
    paymentTerms: 'Net-30 (50% Upfront, 50% Milestone Completion)',
    status: paymentRecorded ? 'Paid' : 'Partial Payment',
    items: [
      { name: 'Enterprise Cloud Server X900', qty: 2, unitPrice: 45000, total: 90000 },
      { name: 'AI Workload Optimizer Add-on', qty: 5, unitPrice: 8500, total: 42500 },
      { name: 'Priority 24/7 SLA Support (Annual)', qty: 1, unitPrice: 22000, total: 22000 },
    ]
  };

  const currentStep = paymentRecorded ? 3 : 2;

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentRecorded(true);
    setShowPaymentModal(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/invoices')}
          className="inline-flex items-center text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Invoices List
        </button>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm">
            <Download className="w-4 h-4 mr-1.5" />
            Download PDF Summary
          </Button>
          {!paymentRecorded && (
            <Button variant="primary" size="sm" onClick={() => setShowPaymentModal(true)}>
              <DollarSign className="w-4 h-4 mr-1.5" />
              Record Payment
            </Button>
          )}
        </div>
      </div>

      {/* Invoice Title Card */}
      <Card padding="lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Invoice {invoiceData.id}
              </h1>
              {paymentRecorded ? (
                <Badge variant="success">Fully Paid</Badge>
              ) : (
                <Badge variant="warning">Partial Net-30 Balance Due</Badge>
              )}
              <Badge variant="primary" size="sm">Screen 13</Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Associated Quote: <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">{invoiceData.quoteRef}</span>
            </p>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider">
              Total Invoice Amount
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-slate-100 font-mono mt-0.5">
              ${invoiceData.totalAmount.toLocaleString()}
            </div>
          </div>
        </div>

        {/* 4-Step Stepper */}
        <div className="py-6 border-b border-slate-200 dark:border-slate-800">
          <HorizontalStepper
            currentStep={currentStep}
            steps={[
              { label: 'Invoice Issued', date: invoiceData.issueDate },
              { label: '50% Upfront Received', date: '2026-08-31' },
              { label: 'Net-30 Final Due', date: invoiceData.dueDate },
              { label: 'Invoice Cleared', date: paymentRecorded ? 'Today' : 'Pending' },
            ]}
          />
        </div>

        {/* System Detail Banner */}
        <div className="mt-6">
          <DetailBanner
            title="Net-30 Billing Schedule & Upfront Milestone Governance"
            type="info"
          >
            This invoice is governed by standard enterprise Net-30 payment terms. Upfront 50% deposit (${(invoiceData.totalAmount / 2).toLocaleString()}) was reconciled on 2026-08-31. Final balance is due on {invoiceData.dueDate}.
          </DetailBanner>
        </div>

        {/* Metadata Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Building className="w-4 h-4 text-indigo-600" /> Billed To
            </div>
            <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{invoiceData.customer}</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">{invoiceData.contact}</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Calendar className="w-4 h-4 text-emerald-600" /> Dates & Terms
            </div>
            <div className="text-xs text-slate-700 dark:text-slate-300">Issue: <span className="font-mono font-semibold">{invoiceData.issueDate}</span></div>
            <div className="text-xs text-slate-700 dark:text-slate-300 mt-1">Due: <span className="font-mono font-semibold text-amber-600">{invoiceData.dueDate}</span></div>
            <div className="text-[11px] text-slate-500 mt-1">{invoiceData.paymentTerms}</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <CreditCard className="w-4 h-4 text-purple-600" /> Payment Summary
            </div>
            <div className="text-xs text-slate-700 dark:text-slate-300">Paid: <span className="font-mono font-bold text-emerald-600">${invoiceData.paidAmount.toLocaleString()}</span></div>
            <div className="text-xs text-slate-700 dark:text-slate-300 mt-1">Remaining: <span className="font-mono font-bold text-amber-600">${invoiceData.remainingBalance.toLocaleString()}</span></div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mt-8">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">
            Invoice Line Items
          </h3>
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Item Description</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Unit Price ($)</th>
                  <th className="py-3 px-4 text-right">Line Total ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {invoiceData.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      {item.name}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-700 dark:text-slate-300">
                      {item.qty}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700 dark:text-slate-300">
                      ${item.unitPrice.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                      ${item.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Record Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              Record Invoice Payment
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Enter payment amount to settle outstanding Net-30 balance for {invoiceData.id}.
            </p>

            <form onSubmit={handleRecordPayment} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Amount ($)
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Method
                </label>
                <select className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
                  <option>ACH / Wire Transfer</option>
                  <option>Credit Card / Stripe</option>
                  <option>Corporate Check</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <Button variant="secondary" size="sm" onClick={() => setShowPaymentModal(false)} type="button">
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Confirm Payment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
