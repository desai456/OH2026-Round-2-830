import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Filter,
  FileText,
  ShieldAlert,
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { CUSTOMERS } from '../../data/mockData';
import { Badge, Button, Card } from '../../components/ui';
import { QuoteStatus, RiskLevel } from '../../types';

export default function QuotationList() {
  const { quotes, setSelectedQuoteId, createQuote, getQuoteMetrics } = useAppContext();
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const navigate = useNavigate();

  const handleCreateNewQuote = () => {
    const newQuote = createQuote(CUSTOMERS[0].id);
    setSelectedQuoteId(newQuote.id);
    navigate(`/quotes/${newQuote.id}`);
  };

  const handleRowClick = (id: string) => {
    setSelectedQuoteId(id);
    navigate(`/quotes/${id}`);
  };

  const filteredQuotes = quotes.filter(q => {
    const matchesSearch =
      q.quoteNumber.toLowerCase().includes(search.toLowerCase()) ||
      q.owner.toLowerCase().includes(search.toLowerCase()) ||
      q.opportunity.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: QuoteStatus) => {
    switch (status) {
      case 'Approved':
      case 'Confirmed':
      case 'Paid':
        return 'success';
      case 'Pending Approval':
      case 'Under Negotiation':
        return 'warning';
      case 'Rejected':
        return 'danger';
      case 'Invoiced':
      case 'Fulfillment':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Main Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Quotations</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enterprise transaction portfolio, discount governance, and status tracking
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="bg-slate-200 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <Button onClick={handleCreateNewQuote} variant="primary" className="font-bold shadow-xs">
            <Plus className="w-4 h-4" />
            <span>+ New Quotation</span>
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by quote #, owner, opportunity..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="py-2 px-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Approved">Approved</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Invoiced">Invoiced</option>
            <option value="Paid">Paid</option>
          </select>
        </div>
      </div>

      {/* VIEW MODE 1: Table */}
      {viewMode === 'table' ? (
        <Card className="p-0 overflow-hidden border-slate-200/80 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Quote #</th>
                  <th className="py-3 px-4">Customer & Opportunity</th>
                  <th className="py-3 px-3">Owner</th>
                  <th className="py-3 px-4 text-right">Contract Value</th>
                  <th className="py-3 px-3 text-right">Gross Margin</th>
                  <th className="py-3 px-3 text-center">Risk Score</th>
                  <th className="py-3 px-3 text-center">Stage</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {filteredQuotes.map(q => {
                  const metrics = getQuoteMetrics(q);
                  const cust = CUSTOMERS.find(c => c.id === q.customerId);
                  const riskVariant = metrics.riskLevel === 'HIGH' ? 'danger' : metrics.riskLevel === 'MEDIUM' ? 'warning' : 'success';

                  return (
                    <tr
                      key={q.id}
                      onClick={() => handleRowClick(q.id)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-bold text-blue-600 dark:text-blue-400">{q.quoteNumber}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 dark:text-slate-100 block">{cust?.name || 'Enterprise Customer'}</span>
                        <span className="text-[11px] text-slate-400">{q.opportunity}</span>
                      </td>
                      <td className="py-3.5 px-3 font-medium text-slate-700 dark:text-slate-300">{q.owner}</td>
                      <td className="py-3.5 px-4 text-right font-black text-slate-900 dark:text-slate-100">
                        ${metrics.contractValue.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {metrics.marginPercent.toFixed(1)}% (${metrics.grossMargin.toLocaleString()})
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <Badge variant={riskVariant} size="sm">{metrics.riskScore}/100 ({metrics.riskLevel})</Badge>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <Badge variant={getStatusBadge(q.status)} size="sm">{q.status}</Badge>
                      </td>
                      <td className="py-3.5 px-4 text-center" onClick={e => e.stopPropagation()}>
                        <Button onClick={() => handleRowClick(q.id)} variant="outline" size="sm">
                          <Eye className="w-3.5 h-3.5" />
                          <span>Open</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* VIEW MODE 2: Kanban Board */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {['Draft', 'Pending Approval', 'Approved', 'Confirmed'].map(status => {
            const quotesInCol = filteredQuotes.filter(q => q.status === status);
            return (
              <div key={status} className="bg-slate-200/50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-300/60 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{status}</span>
                  <Badge size="sm">{quotesInCol.length}</Badge>
                </div>
                <div className="space-y-2.5">
                  {quotesInCol.map(q => {
                    const metrics = getQuoteMetrics(q);
                    return (
                      <div
                        key={q.id}
                        onClick={() => handleRowClick(q.id)}
                        className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md cursor-pointer transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-blue-600 dark:text-blue-400">{q.quoteNumber}</span>
                          <Badge variant={metrics.riskLevel === 'HIGH' ? 'danger' : 'success'} size="sm">
                            {metrics.riskLevel}
                          </Badge>
                        </div>
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">{q.opportunity}</span>
                        <div className="flex justify-between items-baseline pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                          <span className="text-slate-400">Total:</span>
                          <span className="font-black text-slate-900 dark:text-slate-100">${metrics.contractValue.toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
