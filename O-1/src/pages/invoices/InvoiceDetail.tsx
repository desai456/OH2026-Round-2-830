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
          className="inline-flex items-center text-xs font-semibold text-[#A6A39C] hover:text-[#F5F1EA] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Invoices List
        </button>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded-full border border-white/10 text-xs font-semibold text-[#F5F1EA] hover:bg-white/5 transition-all flex items-center gap-2">
            <Download className="w-4 h-4 text-[#A6A39C]" />
            <span>Download PDF Summary</span>
          </button>
          {!paymentRecorded && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="px-5 py-2 text-xs font-bold rounded-full bg-[#F5F1EA] text-[#0A0A0B] hover:bg-white transition-all flex items-center gap-2 shadow-sm"
            >
              <DollarSign className="w-4 h-4" />
              <span>Record Payment</span>
            </button>
          )}
        </div>
      </div>

      {/* Invoice Title Card */}
      <div className="bg-[#151517] border border-white/8 rounded-[20px] p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-serif text-[#F5F1EA] tracking-tight">
                Invoice {invoiceData.id}
              </h1>
              {paymentRecorded ? (
                <Badge variant="success">Fully Paid</Badge>
              ) : (
                <Badge variant="warning">Partial Net-30 Balance Due</Badge>
              )}
              <Badge variant="primary" size="sm">Screen 13</Badge>
            </div>
            <p className="text-xs text-[#A6A39C] mt-1">
              Associated Quote: <span className="font-mono font-bold text-[#FF7A45]">{invoiceData.quoteRef}</span>
            </p>
          </div>

          <div className="text-right">
            <div className="text-xs text-[#A6A39C] uppercase font-semibold tracking-wider">
              Total Invoice Amount
            </div>
            <div className="text-3xl font-serif font-bold text-[#F5F1EA] mt-0.5">
              ${invoiceData.totalAmount.toLocaleString()}
            </div>
          </div>
        </div>

        {/* 4-Step Stepper */}
        <div className="py-2 border-b border-white/8">
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
        <div>
          <DetailBanner
            title="Net-30 Billing Schedule & Upfront Milestone Governance"
            type="info"
          >
            This invoice is governed by standard enterprise Net-30 payment terms. Upfront 50% deposit (${(invoiceData.totalAmount / 2).toLocaleString()}) was reconciled on 2026-08-31. Final balance is due on {invoiceData.dueDate}.
          </DetailBanner>
        </div>

        {/* Metadata Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#1C1C1E] border border-white/8">
            <div className="flex items-center gap-2 text-[#A6A39C] text-xs font-semibold uppercase tracking-wider mb-2">
              <Building className="w-4 h-4 text-[#FF4A1C]" /> Billed To
            </div>
            <div className="font-bold text-[#F5F1EA] text-sm">{invoiceData.customer}</div>
            <div className="text-xs text-[#A6A39C] mt-0.5">{invoiceData.contact}</div>
          </div>

          <div className="p-4 rounded-xl bg-[#1C1C1E] border border-white/8">
            <div className="flex items-center gap-2 text-[#A6A39C] text-xs font-semibold uppercase tracking-wider mb-2">
              <Calendar className="w-4 h-4 text-emerald-400" /> Dates & Terms
            </div>
            <div className="text-xs text-[#F5F1EA]">Issue: <span className="font-mono font-semibold text-[#A6A39C]">{invoiceData.issueDate}</span></div>
            <div className="text-xs text-[#F5F1EA] mt-1">Due: <span className="font-mono font-semibold text-amber-400">{invoiceData.dueDate}</span></div>
            <div className="text-[11px] text-[#A6A39C] mt-1">{invoiceData.paymentTerms}</div>
          </div>

          <div className="p-4 rounded-xl bg-[#1C1C1E] border border-white/8">
            <div className="flex items-center gap-2 text-[#A6A39C] text-xs font-semibold uppercase tracking-wider mb-2">
              <CreditCard className="w-4 h-4 text-purple-400" /> Payment Summary
            </div>
            <div className="text-xs text-[#F5F1EA]">Paid: <span className="font-mono font-bold text-emerald-400">${invoiceData.paidAmount.toLocaleString()}</span></div>
            <div className="text-xs text-[#F5F1EA] mt-1">Remaining: <span className="font-mono font-bold text-amber-400">${invoiceData.remainingBalance.toLocaleString()}</span></div>
          </div>
        </div>

        {/* Line Items Table */}
        <div>
          <h3 className="text-xs font-semibold text-[#F5F1EA] uppercase tracking-wider mb-3">
            Invoice Line Items
          </h3>
          <div className="overflow-x-auto border border-white/8 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/8 bg-[#121214] text-[#A6A39C] font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">Item Description</th>
                  <th className="py-3.5 px-4 text-center">Qty</th>
                  <th className="py-3.5 px-4 text-right">Unit Price ($)</th>
                  <th className="py-3.5 px-4 text-right">Line Total ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[#F5F1EA]">
                {invoiceData.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02]">
                    <td className="py-3.5 px-4 font-bold text-[#F5F1EA]">
                      {item.name}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-[#A6A39C]">
                      {item.qty}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-[#A6A39C]">
                      ${item.unitPrice.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-[#F5F1EA]">
                      ${item.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#151517] border border-white/10 rounded-[20px] p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-serif font-bold text-[#F5F1EA] flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              Record Invoice Payment
            </h3>
            <p className="text-xs text-[#A6A39C] mt-1">
              Enter payment amount to settle outstanding Net-30 balance for {invoiceData.id}.
            </p>

            <form onSubmit={handleRecordPayment} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#F5F1EA] mb-1">
                  Payment Amount ($)
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-white/10 bg-[#1C1C1E] text-[#F5F1EA] font-mono focus:outline-none focus:border-[#FF4A1C]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F5F1EA] mb-1">
                  Payment Method
                </label>
                <select className="w-full px-3.5 py-2 text-xs rounded-xl border border-white/10 bg-[#1C1C1E] text-[#F5F1EA]">
                  <option>ACH / Wire Transfer</option>
                  <option>Credit Card / Stripe</option>
                  <option>Corporate Check</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  type="button"
                  className="px-4 py-2 rounded-full border border-white/10 text-xs font-semibold text-[#F5F1EA] hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-full bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all shadow-sm"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
