import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, CheckCircle2, ShieldCheck, ArrowRight, MessageSquare, RefreshCw, FileText, Send, Sparkles } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { Badge, Button, Card, Modal } from '../../components/ui';

export default function CustomerPortal() {
  const { quotes, submitCustomerCounterOffer, confirmQuote, getQuoteMetrics } = useAppContext();
  const navigate = useNavigate();
  const quote = quotes[0]; // Q-1042 Acme Corp
  const metrics = getQuoteMetrics(quote);

  const [isCounterModalOpen, setIsCounterModalOpen] = useState(false);
  const [requestedDiscount, setRequestedDiscount] = useState(20);
  const [counterReason, setCounterReason] = useState('We are expanding our total order volume across all regional offices.');

  const handleSubmitCounter = (e: React.FormEvent) => {
    e.preventDefault();
    submitCustomerCounterOffer(quote.id, requestedDiscount, counterReason);
    setIsCounterModalOpen(false);
  };

  const handleConfirmQuote = () => {
    confirmQuote(quote.id);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Customer Portal Top Bar (NO internal nav bar) */}
      <header className="h-16 px-8 bg-slate-950 border-b border-slate-800 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-lg flex items-center justify-center shadow-lg">
            DF
          </div>
          <div>
            <h1 className="font-extrabold text-base text-white tracking-tight flex items-center gap-2">
              DEALFLOW360
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 font-bold border border-blue-800">
                CLIENT PORTAL
              </span>
            </h1>
            <p className="text-[10px] text-slate-400">Official Commercial Proposal</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={() => navigate('/dashboard')} variant="outline" size="sm">
            Exit to Internal Operations View
          </Button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 p-6 lg:p-12 max-w-5xl mx-auto w-full space-y-8">
        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-900/80 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-blue-400 font-bold uppercase tracking-wider">Proposal For</span>
              <Badge variant="primary" size="sm">Acme Corp</Badge>
            </div>
            <h2 className="text-2xl font-black text-white">Commercial Quote {quote.quoteNumber}</h2>
            <p className="text-xs text-slate-400 mt-1">Opportunity: Enterprise Expansion • Prepared by Alex Morgan</p>
          </div>
          <Badge variant={quote.status === 'Confirmed' ? 'success' : quote.status === 'Pending Approval' ? 'warning' : 'primary'} size="lg">
            {quote.status}
          </Badge>
        </div>

        {/* Automatic Re-approval Flow Indicator */}
        <Card className="bg-slate-950 border-slate-800 space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-blue-400" />
            Automatic Governance & Re-Approval Pipeline
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Step 1</span>
              <span className="font-bold text-blue-400 block mt-0.5">Customer Request</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Step 2</span>
              <span className="font-bold text-amber-400 block mt-0.5">Recalculate Risk</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Step 3</span>
              <span className="font-bold text-indigo-400 block mt-0.5">Manager Approval</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Step 4</span>
              <span className="font-bold text-purple-400 block mt-0.5">Finance Approval</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800">
              <span className="text-[10px] text-emerald-400 block">Step 5</span>
              <span className="font-bold text-emerald-300 block mt-0.5">Client Confirmation</span>
            </div>
          </div>
        </Card>

        {/* Quote Line Item Review Table */}
        <Card className="bg-slate-950 border-slate-800 p-0 overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">Quotation Line Items</h3>
            <span className="text-xs text-slate-400">All prices in USD</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                  <th className="p-4">Product Description</th>
                  <th className="p-4 text-center">Qty</th>
                  <th className="p-4 text-right">Unit Price</th>
                  <th className="p-4 text-center">Discount</th>
                  <th className="p-4 text-right">Net Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {metrics.lineDetails.map(l => (
                  <tr key={l.id}>
                    <td className="p-4 font-semibold text-white">{l.product.name}</td>
                    <td className="p-4 text-center font-bold text-slate-300">{l.qty}</td>
                    <td className="p-4 text-right text-slate-300">${l.unitPriceWithConfig.toLocaleString()}</td>
                    <td className="p-4 text-center font-bold text-amber-400">{l.discountPercent}%</td>
                    <td className="p-4 text-right font-black text-white">${l.finalLineTotal.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-6 bg-slate-900/60 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400 block font-semibold">Total Contract Value</span>
              <span className="text-3xl font-black text-white">${metrics.contractValue.toLocaleString()}</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button onClick={() => setIsCounterModalOpen(true)} variant="outline" className="flex-1 sm:flex-none">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span>Counter Discount</span>
              </Button>
              <Button onClick={handleConfirmQuote} variant="success" className="flex-1 sm:flex-none font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Proposal</span>
              </Button>
            </div>
          </div>
        </Card>
      </main>

      {/* Counter Discount Modal */}
      <Modal
        isOpen={isCounterModalOpen}
        onClose={() => setIsCounterModalOpen(false)}
        title="Submit Counter Discount Request"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitCounter} className="space-y-4 text-slate-900 dark:text-slate-100">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Current Applied Discount: <strong className="text-slate-900 dark:text-slate-100">18%</strong>
            </label>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mt-3 mb-1">
              Requested Global Discount (%):
            </label>
            <input
              type="number"
              min="0"
              max="50"
              value={requestedDiscount}
              onChange={e => setRequestedDiscount(Number(e.target.value))}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Business Rationale for Counter-Offer:
            </label>
            <textarea
              value={counterReason}
              onChange={e => setCounterReason(e.target.value)}
              rows={3}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              required
            />
          </div>

          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200">
            <strong>Self-Governing Note:</strong> Submitting a counter-offer above 15% will automatically elevate risk and re-trigger Sales Manager & Finance approval steps.
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button type="button" onClick={() => setIsCounterModalOpen(false)} variant="secondary">Cancel</Button>
            <Button type="submit" variant="primary" className="font-bold">
              <Send className="w-4 h-4" />
              <span>Submit Counter Offer</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
