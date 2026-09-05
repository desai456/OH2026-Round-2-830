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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Main Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-medium text-[#F5F1EA] tracking-tight">Quotations</h1>
          <p className="text-xs text-[#A6A39C] mt-1">
            Enterprise transaction portfolio, discount governance, and status tracking
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="bg-[#1C1C1E] p-1 rounded-full border border-white/8 flex items-center gap-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-full text-xs font-semibold transition-colors ${
                viewMode === 'table'
                  ? 'bg-[#FF4A1C] text-[#F5F1EA]'
                  : 'text-[#A6A39C] hover:text-[#F5F1EA]'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-full text-xs font-semibold transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-[#FF4A1C] text-[#F5F1EA]'
                  : 'text-[#A6A39C] hover:text-[#F5F1EA]'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <Button onClick={handleCreateNewQuote} variant="primary">
            <span>+ New Quotation</span>
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card padding="sm" className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#A6A39C] absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by quote #, owner, opportunity..."
              className="w-full pl-9 pr-4 py-2 bg-[#1C1C1E] border border-white/8 rounded-full text-xs text-[#F5F1EA] placeholder-[#6E6C68] focus:outline-none focus:ring-2 focus:ring-[#FF7A45]/40"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-[#A6A39C]" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="py-2 px-4 bg-[#1C1C1E] border border-white/8 rounded-full text-xs text-[#F5F1EA] focus:outline-none"
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
      </Card>

      {/* VIEW MODE 1: Table */}
      {viewMode === 'table' ? (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1C1C1E] border-b border-white/8 text-[11px] font-bold text-[#A6A39C] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Quote #</th>
                  <th className="py-3.5 px-4">Customer & Opportunity</th>
                  <th className="py-3.5 px-3">Owner</th>
                  <th className="py-3.5 px-4 text-right">Contract Value</th>
                  <th className="py-3.5 px-3 text-right">Gross Margin</th>
                  <th className="py-3.5 px-3 text-center">Risk Score</th>
                  <th className="py-3.5 px-3 text-center">Stage</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8 text-xs">
                {filteredQuotes.map(q => {
                  const metrics = getQuoteMetrics(q);
                  const cust = CUSTOMERS.find(c => c.id === q.customerId);
                  const riskVariant = metrics.riskLevel === 'HIGH' ? 'danger' : metrics.riskLevel === 'MEDIUM' ? 'warning' : 'success';

                  return (
                    <tr
                      key={q.id}
                      onClick={() => handleRowClick(q.id)}
                      className="hover:bg-white/5 cursor-pointer transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-bold font-mono text-[#FF7A45]">{q.quoteNumber}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-[#F5F1EA] block">{cust?.name || 'Enterprise Customer'}</span>
                        <span className="text-[11px] text-[#A6A39C]">{q.opportunity}</span>
                      </td>
                      <td className="py-3.5 px-3 font-medium text-[#A6A39C]">{q.owner}</td>
                      <td className="py-3.5 px-4 text-right font-bold font-sans tabular-nums text-[#F5F1EA]">
                        ${metrics.contractValue.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-emerald-400">
                        {metrics.marginPercent.toFixed(1)}% (${metrics.grossMargin.toLocaleString()})
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <Badge variant={riskVariant} size="sm">{metrics.riskScore}/100 ({metrics.riskLevel})</Badge>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <Badge variant={getStatusBadge(q.status)} size="sm">{q.status}</Badge>
                      </td>
                      <td className="py-3.5 px-4 text-center" onClick={e => e.stopPropagation()}>
                        <Button onClick={() => handleRowClick(q.id)} variant="secondary" size="sm">
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
              <div key={status} className="bg-[#121214] p-4 rounded-[20px] border border-white/8 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/8">
                  <span className="text-xs font-bold text-[#A6A39C] uppercase tracking-wider">{status}</span>
                  <Badge size="sm">{quotesInCol.length}</Badge>
                </div>
                <div className="space-y-2.5">
                  {quotesInCol.map(q => {
                    const metrics = getQuoteMetrics(q);
                    return (
                      <Card
                        key={q.id}
                        onClick={() => handleRowClick(q.id)}
                        className="p-4 bg-[#151517] cursor-pointer hover:border-white/20 transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs font-mono text-[#FF7A45]">{q.quoteNumber}</span>
                          <Badge variant={metrics.riskLevel === 'HIGH' ? 'danger' : 'success'} size="sm">
                            {metrics.riskLevel}
                          </Badge>
                        </div>
                        <span className="text-xs font-semibold text-[#F5F1EA] block">{q.opportunity}</span>
                        <div className="flex justify-between items-baseline pt-2 border-t border-white/8 text-xs">
                          <span className="text-[#A6A39C]">Total:</span>
                          <span className="font-bold font-sans tabular-nums text-[#F5F1EA]">${metrics.contractValue.toLocaleString()}</span>
                        </div>
                      </Card>
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
