import React from 'react';
import { CreditCard, Receipt, CheckCircle2, Download, Send, DollarSign } from 'lucide-react';
import { HybridBillingCard } from '../../components/billing/HybridBillingCard';
import { useAppContext } from '../../context/AppContext';
import { Badge, Button, Card } from '../../components/ui';

export default function Billing() {
  const { invoices, recordPayment, generateInvoiceFromQuote, quotes } = useAppContext();
  const activeInvoice = invoices[0] || {
    id: 'inv-1042',
    invoiceNumber: 'INV-1042',
    quoteNumber: 'Q-1042',
    customerName: 'Acme Corp',
    issueDate: '2026-09-05',
    dueDate: '2026-10-05',
    amount: 85500,
    status: 'Sent',
    lines: [
      { id: '1', description: 'Enterprise Laptop Pro 16 x 10', qty: 10, unitPrice: 7040, total: 70400 },
      { id: '2', description: 'Setup & Onboarding Service x 1', qty: 1, unitPrice: 4100, total: 4100 },
    ],
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-[#151517] border border-white/8 rounded-[20px] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-[#F5F1EA] tracking-tight flex items-center gap-3">
            <Receipt className="w-7 h-7 text-[#FF4A1C]" />
            Hybrid Billing & Invoicing
          </h1>
          <p className="text-xs text-[#A6A39C] mt-1">
            Dual-schedule billing revenue engine for one-time deliverables & subscriptions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => generateInvoiceFromQuote(quotes[0].id)}
            className="px-5 py-2 text-xs font-bold rounded-full bg-[#F5F1EA] text-[#0A0A0B] hover:bg-white transition-all flex items-center gap-2 shadow-sm"
          >
            <Receipt className="w-4 h-4" />
            <span>Generate New Invoice</span>
          </button>
        </div>
      </div>

      {/* Main Hybrid Billing Card */}
      <HybridBillingCard />

      {/* Invoice Detail Section */}
      <div className="bg-[#151517] border border-white/8 rounded-[20px] p-6 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-white/8">
          <div>
            <h3 className="font-serif font-bold text-base text-[#F5F1EA]">
              Active Invoice: {activeInvoice.invoiceNumber}
            </h3>
            <p className="text-xs text-[#A6A39C]">Customer: {activeInvoice.customerName} • Quote {activeInvoice.quoteNumber}</p>
          </div>
          <Badge variant={activeInvoice.status === 'Paid' ? 'success' : 'warning'}>
            {activeInvoice.status}
          </Badge>
        </div>

        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-white/8">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#121214] border-b border-white/8 text-[11px] font-semibold text-[#A6A39C] uppercase">
                  <th className="p-3.5">Description</th>
                  <th className="p-3.5 text-center">Qty</th>
                  <th className="p-3.5 text-right">Unit Price</th>
                  <th className="p-3.5 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[#F5F1EA]">
                {activeInvoice.lines.map(line => (
                  <tr key={line.id} className="hover:bg-white/[0.02]">
                    <td className="p-3.5 font-medium">{line.description}</td>
                    <td className="p-3.5 text-center text-[#A6A39C]">{line.qty}</td>
                    <td className="p-3.5 text-right text-[#A6A39C]">${line.unitPrice.toLocaleString()}</td>
                    <td className="p-3.5 text-right font-bold text-[#F5F1EA]">${line.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/8">
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-full border border-white/10 text-xs font-semibold text-[#F5F1EA] hover:bg-white/5 transition-all flex items-center gap-2">
                <Download className="w-4 h-4 text-[#A6A39C]" />
                <span>Download PDF</span>
              </button>
              <button className="px-4 py-2 rounded-full border border-white/10 text-xs font-semibold text-[#F5F1EA] hover:bg-white/5 transition-all flex items-center gap-2">
                <Send className="w-4 h-4 text-[#A6A39C]" />
                <span>Send to Client</span>
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[10px] text-[#A6A39C] font-semibold uppercase block">Total Due</span>
                <span className="text-xl font-bold text-[#F5F1EA]">${activeInvoice.amount.toLocaleString()}</span>
              </div>
              {activeInvoice.status !== 'Paid' && (
                <button
                  onClick={() => recordPayment(activeInvoice.id)}
                  className="px-5 py-2.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-all flex items-center gap-2 shadow-sm"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Record Payment</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
