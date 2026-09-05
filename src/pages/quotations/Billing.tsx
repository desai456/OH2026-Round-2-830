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
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Receipt className="w-7 h-7 text-blue-600" />
            Hybrid Billing & Invoicing
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Dual-schedule billing revenue engine for one-time deliverables & subscriptions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => generateInvoiceFromQuote(quotes[0].id)} variant="primary" className="font-bold shadow-xs">
            <Receipt className="w-4 h-4" />
            <span>Generate New Invoice</span>
          </Button>
        </div>
      </div>

      {/* Main Hybrid Billing Card */}
      <HybridBillingCard />

      {/* Invoice Detail Section */}
      <Card className="border-slate-200/80 dark:border-slate-800 shadow-md">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              Active Invoice: {activeInvoice.invoiceNumber}
            </h3>
            <p className="text-xs text-slate-500">Customer: {activeInvoice.customerName} • Quote {activeInvoice.quoteNumber}</p>
          </div>
          <Badge variant={activeInvoice.status === 'Paid' ? 'success' : 'warning'}>
            {activeInvoice.status}
          </Badge>
        </div>

        <div className="py-4 space-y-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b text-[11px] font-bold text-slate-500 uppercase">
                <th className="p-3">Description</th>
                <th className="p-3 text-center">Qty</th>
                <th className="p-3 text-right">Unit Price</th>
                <th className="p-3 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {activeInvoice.lines.map(line => (
                <tr key={line.id}>
                  <td className="p-3 font-medium text-slate-900 dark:text-slate-100">{line.description}</td>
                  <td className="p-3 text-center text-slate-600 dark:text-slate-400">{line.qty}</td>
                  <td className="p-3 text-right text-slate-600 dark:text-slate-400">${line.unitPrice.toLocaleString()}</td>
                  <td className="p-3 text-right font-bold text-slate-900 dark:text-slate-100">${line.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </Button>
              <Button variant="outline" size="sm">
                <Send className="w-4 h-4" />
                <span>Send to Client</span>
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Due</span>
                <span className="text-xl font-black text-slate-900 dark:text-slate-100">${activeInvoice.amount.toLocaleString()}</span>
              </div>
              {activeInvoice.status !== 'Paid' && (
                <Button onClick={() => recordPayment(activeInvoice.id)} variant="success" className="font-bold">
                  <DollarSign className="w-4 h-4" />
                  <span>Record Payment</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
