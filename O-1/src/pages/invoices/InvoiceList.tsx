import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Search, DollarSign, Download, Filter, CheckCircle2, Clock, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { Badge, Button, Card, StatusTabs } from '../../components/ui';

interface Invoice {
  id: string;
  customer: string;
  quoteRef: string;
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Unpaid' | 'Overdue';
  createdDate: string;
}

export default function InvoiceList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'All' | 'Unpaid' | 'Paid' | 'Overdue'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const [invoices] = useState<Invoice[]>([
    { id: 'INV-2026-089', customer: 'Acme Corp', quoteRef: 'QT-2026-1049', amount: 154500, dueDate: '2026-09-30', status: 'Unpaid', createdDate: '2026-08-30' },
    { id: 'INV-2026-088', customer: 'Stark Industries', quoteRef: 'QT-2026-1042', amount: 98000, dueDate: '2026-09-15', status: 'Paid', createdDate: '2026-08-15' },
    { id: 'INV-2026-087', customer: 'Wayne Enterprises', quoteRef: 'QT-2026-1038', amount: 45000, dueDate: '2026-08-01', status: 'Overdue', createdDate: '2026-07-01' },
    { id: 'INV-2026-086', customer: 'Cyberdyne Systems', quoteRef: 'QT-2026-1035', amount: 120000, dueDate: '2026-10-10', status: 'Unpaid', createdDate: '2026-09-01' },
  ]);

  const filteredInvoices = invoices.filter(inv => {
    const matchesTab = activeTab === 'All' || inv.status === activeTab;
    const matchesSearch = inv.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inv.quoteRef.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const totalOutstanding = invoices.filter(i => i.status === 'Unpaid' || i.status === 'Overdue').reduce((acc, i) => acc + i.amount, 0);
  const totalCollected = invoices.filter(i => i.status === 'Paid').reduce((acc, i) => acc + i.amount, 0);
  const totalOverdue = invoices.filter(i => i.status === 'Overdue').reduce((acc, i) => acc + i.amount, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-[#151517] border border-white/8 rounded-[20px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-serif text-[#F5F1EA] tracking-tight flex items-center gap-3">
              <FileText className="w-7 h-7 text-[#FF4A1C]" />
              Invoices & Accounts Receivable
            </h1>
            <Badge variant="primary" size="sm">Screen 12</Badge>
          </div>
          <p className="text-xs text-[#A6A39C] mt-1">
            Track billed invoices, payment status, partial collection milestones, and overdue accounts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded-full border border-white/10 text-xs font-semibold text-[#F5F1EA] hover:bg-white/5 transition-all flex items-center gap-2">
            <Download className="w-4 h-4 text-[#A6A39C]" />
            <span>Export AR Ledger</span>
          </button>
          <button className="px-5 py-2 text-xs font-bold rounded-full bg-[#F5F1EA] text-[#0A0A0B] hover:bg-white transition-all flex items-center gap-2 shadow-sm">
            <DollarSign className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Financial Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#151517] border border-white/8 border-l-4 border-l-amber-500 rounded-[20px] p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#A6A39C] uppercase tracking-wider">
              Total Outstanding AR
            </span>
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl font-bold text-[#F5F1EA] mt-2 font-serif">
            ${totalOutstanding.toLocaleString()}
          </p>
          <span className="text-[11px] text-[#A6A39C] mt-1 block">
            Across active Net-30 customer invoices
          </span>
        </div>

        <div className="bg-[#151517] border border-white/8 border-l-4 border-l-emerald-500 rounded-[20px] p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#A6A39C] uppercase tracking-wider">
              Collected This Month
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-[#F5F1EA] mt-2 font-serif">
            ${totalCollected.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> 100% processing success rate
          </span>
        </div>

        <div className="bg-[#151517] border border-white/8 border-l-4 border-l-rose-500 rounded-[20px] p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#A6A39C] uppercase tracking-wider">
              Overdue Amount
            </span>
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          </div>
          <p className="text-3xl font-bold text-[#F5F1EA] mt-2 font-serif">
            ${totalOverdue.toLocaleString()}
          </p>
          <span className="text-[11px] text-rose-400 font-semibold mt-1 block">
            1 account requires payment escalation
          </span>
        </div>
      </div>

      {/* Main Invoices Section */}
      <div className="bg-[#151517] border border-white/8 rounded-[20px] p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <StatusTabs
            tabs={[
              { id: 'All', label: 'All Invoices', count: invoices.length },
              { id: 'Unpaid', label: 'Unpaid', count: invoices.filter(i => i.status === 'Unpaid').length },
              { id: 'Paid', label: 'Paid', count: invoices.filter(i => i.status === 'Paid').length },
              { id: 'Overdue', label: 'Overdue', count: invoices.filter(i => i.status === 'Overdue').length },
            ]}
            activeTab={activeTab}
            onChange={(tab) => setActiveTab(tab as any)}
          />

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A6A39C]" />
            <input
              type="text"
              placeholder="Search invoice #, customer, quote..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-full border border-white/10 bg-[#1C1C1E] text-[#F5F1EA] placeholder-[#A6A39C] focus:outline-none focus:border-[#FF4A1C]"
            />
          </div>
        </div>

        {/* Invoice Table */}
        <div className="overflow-x-auto rounded-xl border border-white/8">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/8 bg-[#121214] text-[#A6A39C] font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Quote Ref</th>
                <th className="py-3.5 px-4 text-right">Amount ($)</th>
                <th className="py-3.5 px-4">Created Date</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[#F5F1EA]">
              {filteredInvoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                  onClick={() => navigate(`/invoices/${inv.id}`)}
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-[#FF7A45]">
                    {inv.id}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#F5F1EA]">
                    {inv.customer}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#A6A39C]">
                    {inv.quoteRef}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-[#F5F1EA]">
                    ${inv.amount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-[#A6A39C] font-mono text-[11px]">
                    {inv.createdDate}
                  </td>
                  <td className="py-3.5 px-4 text-[#A6A39C] font-mono text-[11px]">
                    {inv.dueDate}
                  </td>
                  <td className="py-3.5 px-4">
                    {inv.status === 'Paid' && <Badge variant="success">Paid</Badge>}
                    {inv.status === 'Unpaid' && <Badge variant="warning">Unpaid</Badge>}
                    {inv.status === 'Overdue' && <Badge variant="danger">Overdue</Badge>}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => navigate(`/invoices/${inv.id}`)}
                      className="px-2 py-1 text-[11px] font-bold text-[#FF7A45] hover:underline"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
