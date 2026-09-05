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
    <div className="min-h-screen text-[#F5F1EA] flex flex-col font-sans">
      {/* Customer Portal Top Bar */}
      <header className="h-16 px-8 bg-[#151517] border-b border-white/8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF4A1C] to-[#E03A0E] text-white font-black text-lg flex items-center justify-center shadow-lg">
            DF
          </div>
          <div>
            <h1 className="font-serif font-extrabold text-base text-[#F5F1EA] tracking-tight flex items-center gap-2">
              DEALFLOW360
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#1C1C1E] text-[#FF4A1C] font-semibold border border-white/10">
                CLIENT PORTAL
              </span>
            </h1>
            <p className="text-[10px] text-[#A6A39C]">Official Commercial Proposal</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-1.5 rounded-full border border-white/10 text-xs font-semibold text-[#F5F1EA] hover:bg-white/5 transition-all"
          >
            Exit to Internal Operations View
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 p-6 lg:p-12 max-w-5xl mx-auto w-full space-y-8">
        {/* Banner */}
        <div className="bg-[#151517] border border-white/8 rounded-[20px] p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-[#FF4A1C] font-semibold uppercase tracking-wider">Proposal For</span>
              <Badge variant="primary" size="sm">Acme Corp</Badge>
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#F5F1EA]">Commercial Quote {quote.quoteNumber}</h2>
            <p className="text-xs text-[#A6A39C] mt-1">Opportunity: Enterprise Expansion • Prepared by Alex Morgan</p>
          </div>
          <Badge variant={quote.status === 'Confirmed' ? 'success' : quote.status === 'Pending Approval' ? 'warning' : 'primary'} size="lg">
            {quote.status}
          </Badge>
        </div>

        {/* Automatic Re-approval Flow Indicator */}
        <div className="bg-[#151517] border border-white/8 rounded-[20px] p-6 space-y-4">
          <h3 className="font-semibold text-xs uppercase tracking-wider text-[#A6A39C] flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-[#FF4A1C]" />
            Automatic Governance & Re-Approval Pipeline
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 text-center text-xs">
            <div className="p-3 rounded-xl bg-[#1C1C1E] border border-white/8">
              <span className="text-[10px] text-[#A6A39C] block">Step 1</span>
              <span className="font-bold text-[#FF7A45] block mt-0.5">Customer Request</span>
            </div>
            <div className="p-3 rounded-xl bg-[#1C1C1E] border border-white/8">
              <span className="text-[10px] text-[#A6A39C] block">Step 2</span>
              <span className="font-bold text-amber-400 block mt-0.5">Recalculate Risk</span>
            </div>
            <div className="p-3 rounded-xl bg-[#1C1C1E] border border-white/8">
              <span className="text-[10px] text-[#A6A39C] block">Step 3</span>
              <span className="font-bold text-purple-400 block mt-0.5">Manager Approval</span>
            </div>
            <div className="p-3 rounded-xl bg-[#1C1C1E] border border-white/8">
              <span className="text-[10px] text-[#A6A39C] block">Step 4</span>
              <span className="font-bold text-indigo-400 block mt-0.5">Finance Approval</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-[10px] text-emerald-400 block">Step 5</span>
              <span className="font-bold text-emerald-300 block mt-0.5">Client Confirmation</span>
            </div>
          </div>
        </div>

        {/* Quote Line Item Review Table */}
        <div className="bg-[#151517] border border-white/8 rounded-[20px] overflow-hidden">
          <div className="p-5 border-b border-white/8 flex justify-between items-center">
            <h3 className="font-semibold text-xs text-[#F5F1EA] uppercase tracking-wider">Quotation Line Items</h3>
            <span className="text-xs text-[#A6A39C]">All prices in USD</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#121214] border-b border-white/8 text-[11px] font-semibold text-[#A6A39C] uppercase">
                  <th className="p-4">Product Description</th>
                  <th className="p-4 text-center">Qty</th>
                  <th className="p-4 text-right">Unit Price</th>
                  <th className="p-4 text-center">Discount</th>
                  <th className="p-4 text-right">Net Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[#F5F1EA]">
                {metrics.lineDetails.map(l => (
                  <tr key={l.id} className="hover:bg-white/[0.02]">
                    <td className="p-4 font-bold text-[#F5F1EA]">{l.product.name}</td>
                    <td className="p-4 text-center font-semibold text-[#A6A39C]">{l.qty}</td>
                    <td className="p-4 text-right text-[#A6A39C]">${l.unitPriceWithConfig.toLocaleString()}</td>
                    <td className="p-4 text-center font-bold text-[#FF7A45]">{l.discountPercent}%</td>
                    <td className="p-4 text-right font-bold text-[#F5F1EA]">${l.finalLineTotal.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-6 bg-[#121214] border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-[#A6A39C] block font-semibold">Total Contract Value</span>
              <span className="text-3xl font-serif font-bold text-[#F5F1EA]">${metrics.contractValue.toLocaleString()}</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => setIsCounterModalOpen(true)}
                className="px-4 py-2 rounded-full border border-white/10 text-xs font-semibold text-[#F5F1EA] hover:bg-white/5 transition-all flex items-center justify-center gap-2 flex-1 sm:flex-none"
              >
                <MessageSquare className="w-4 h-4 text-[#FF4A1C]" />
                <span>Counter Discount</span>
              </button>
              <button
                onClick={handleConfirmQuote}
                className="px-5 py-2 text-xs font-bold rounded-full bg-[#F5F1EA] text-[#0A0A0B] hover:bg-white transition-all flex items-center justify-center gap-2 shadow-sm flex-1 sm:flex-none"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Proposal</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Counter Discount Modal */}
      {isCounterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#151517] border border-white/10 rounded-[20px] p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-serif font-bold text-[#F5F1EA]">Submit Counter Discount Request</h3>
            <form onSubmit={handleSubmitCounter} className="mt-4 space-y-4 text-[#F5F1EA]">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#A6A39C] block mb-1">
                  Current Applied Discount: <strong className="text-[#F5F1EA]">18%</strong>
                </label>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#A6A39C] block mt-3 mb-1">
                  Requested Global Discount (%):
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={requestedDiscount}
                  onChange={e => setRequestedDiscount(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#1C1C1E] border border-white/10 rounded-xl font-bold text-sm text-[#F5F1EA] focus:outline-none focus:border-[#FF4A1C]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#A6A39C] block mb-1">
                  Business Rationale for Counter-Offer:
                </label>
                <textarea
                  value={counterReason}
                  onChange={e => setCounterReason(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 bg-[#1C1C1E] border border-white/10 rounded-xl text-xs text-[#F5F1EA] focus:outline-none focus:border-[#FF4A1C]"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-[#F5F1EA]">
                <strong>Self-Governing Note:</strong> Submitting a counter-offer above 15% will automatically elevate risk and re-trigger Sales Manager & Finance approval steps.
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/8">
                <button
                  type="button"
                  onClick={() => setIsCounterModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-white/10 text-xs font-semibold text-[#F5F1EA] hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-full bg-[#F5F1EA] text-[#0A0A0B] hover:bg-white transition-all flex items-center gap-2 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Counter Offer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
