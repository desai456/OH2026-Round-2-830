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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <FileText className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              Invoices & Accounts Receivable
            </h1>
            <Badge variant="primary" size="sm">Screen 12</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track billed invoices, payment status, partial collection milestones, and overdue accounts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm">
            <Download className="w-4 h-4 mr-1.5" />
            Export AR Ledger
          </Button>
          <Button variant="primary" size="sm">
            <DollarSign className="w-4 h-4 mr-1.5" />
            Record Payment
          </Button>
        </div>
      </div>

      {/* Financial Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Outstanding AR
            </span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-2">
            ${totalOutstanding.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            Across active Net-30 customer invoices
          </span>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Collected This Month
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-2">
            ${totalCollected.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> 100% processing success rate
          </span>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Overdue Amount
            </span>
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-2">
            ${totalOverdue.toLocaleString()}
          </p>
          <span className="text-[11px] text-red-600 font-medium mt-1 block">
            1 account requires payment escalation
          </span>
        </Card>
      </div>

      {/* Main Invoices Section */}
      <Card padding="md">
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
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search invoice #, customer, quote..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Invoice Table */}
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Quote Ref</th>
                <th className="py-3 px-4 text-right">Amount ($)</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredInvoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors cursor-pointer"
                  onClick={() => navigate(`/invoices/${inv.id}`)}
                >
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {inv.id}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                    {inv.customer}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                    {inv.quoteRef}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                    ${inv.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono">
                    {inv.createdDate}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono">
                    {inv.dueDate}
                  </td>
                  <td className="py-3 px-4">
                    {inv.status === 'Paid' && <Badge variant="success">Paid</Badge>}
                    {inv.status === 'Unpaid' && <Badge variant="warning">Unpaid</Badge>}
                    {inv.status === 'Overdue' && <Badge variant="danger">Overdue</Badge>}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => navigate(`/invoices/${inv.id}`)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
