import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  Building2,
  DollarSign,
  User,
  BookOpen,
  Send,
  Eye,
  Save,
  ShieldAlert,
  History,
  Sparkles,
  Layers,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { CUSTOMERS, PRICE_BOOKS } from '../../data/mockData';
import { Badge, Button, Card, Modal } from '../../components/ui';
import { QuoteLineEditor } from '../../components/quotes/QuoteLineEditor';
import { QuoteSummaryCard } from '../../components/quotes/QuoteSummaryCard';
import { DealIntelligencePanel } from '../../components/intelligence/DealIntelligencePanel';
import { QuoteLifecycle } from '../../components/intelligence/QuoteLifecycle';
import { ApprovalTimeline } from '../../components/approvals/ApprovalTimeline';
import { ApprovalPreview } from '../../components/approvals/ApprovalPreview';

export default function QuotationBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { quotes, selectedQuoteId, updateQuote, getQuoteMetrics, currentUser } = useAppContext();

  const activeQuoteId = id || selectedQuoteId || 'q-1042';
  const quote = quotes.find(q => q.id === activeQuoteId || q.quoteNumber === activeQuoteId) || quotes[0];

  const [activeTab, setActiveTab] = useState<'editor' | 'approvals' | 'activity'>('editor');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);

  const metrics = getQuoteMetrics(quote);
  const customer = CUSTOMERS.find(c => c.id === quote.customerId) || CUSTOMERS[0];
  const priceBook = PRICE_BOOKS.find(pb => pb.name === quote.priceBook) || PRICE_BOOKS[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HERO TOP BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center shadow-md">
            Q
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{quote.quoteNumber}</h1>
              <Badge variant="primary" size="md">{customer.name}</Badge>
              <Badge variant={quote.status === 'Approved' ? 'success' : quote.status === 'Pending Approval' ? 'warning' : 'default'}>
                {quote.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
              <span>Opportunity: <strong className="text-slate-700 dark:text-slate-300">{quote.opportunity}</strong></span>
              <span>•</span>
              <span>Owner: <strong className="text-slate-700 dark:text-slate-300">{quote.owner}</strong></span>
            </p>
          </div>
        </div>

        {/* Top Hero Actions */}
        <div className="flex items-center gap-2.5">
          <Button onClick={() => setIsPreviewOpen(true)} variant="outline">
            <Eye className="w-4 h-4" />
            <span>Preview Proposal</span>
          </Button>
          <Button
            onClick={() => {
              if (quote.status === 'Confirmed') navigate(`/fulfillment/${quote.id}`);
              else navigate('/approvals');
            }}
            variant="primary"
            className="font-bold shadow-xs"
          >
            <span>{quote.status === 'Confirmed' ? 'Proceed to Fulfillment' : 'View Approval Workspace'}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Quote Lifecycle Tracker */}
      <QuoteLifecycle currentStatus={quote.status} />

      {/* MAIN LAYOUT: 70% LEFT CONTENT | 30% RIGHT STICKY INTELLIGENCE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 70% MAIN CONTENT COLUMN (8 cols out of 12) */}
        <div className="lg:col-span-8 space-y-6">
          {/* CUSTOMER & ACCOUNT CONTEXT CARD */}
          <Card className="border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                Customer & Price Book Context
              </h3>
              <Badge variant="warning" size="sm">{customer.tier} Tier Account</Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3 text-xs">
              <div>
                <span className="text-slate-400 block font-semibold">Customer Account</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 block text-sm mt-0.5">{customer.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Account Manager</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 block text-sm mt-0.5">{customer.accountManager}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Price Book</span>
                <select
                  value={quote.priceBook}
                  onChange={e => updateQuote(quote.id, { priceBook: e.target.value })}
                  className="mt-0.5 py-1 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-xs text-slate-900 dark:text-slate-100"
                >
                  {PRICE_BOOKS.map(pb => (
                    <option key={pb.id} value={pb.name}>{pb.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Currency</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 block text-sm mt-0.5">{quote.currency}</span>
              </div>
            </div>
          </Card>

          {/* MAIN TABS: Line Editor | Approval Flow | Audit Activity */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                activeTab === 'editor'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Quote Line Editor</span>
            </button>
            <button
              onClick={() => setActiveTab('approvals')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                activeTab === 'approvals'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Approval Flow & Diagram</span>
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                activeTab === 'activity'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Audit Trail ({quote.activities.length})</span>
            </button>
          </div>

          {/* TAB 1: Quote Line Editor */}
          {activeTab === 'editor' && <QuoteLineEditor quote={quote} />}

          {/* TAB 2: Approval Flow & Flowchart */}
          {activeTab === 'approvals' && (
            <div className="space-y-6">
              <ApprovalPreview quote={quote} />
              <Card>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-4">
                  Approval Step Log
                </h3>
                <ApprovalTimeline history={quote.approvalHistory} />
              </Card>
            </div>
          )}

          {/* TAB 3: Activity & Audit Trail */}
          {activeTab === 'activity' && (
            <Card className="space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Full Quotation Audit Log
              </h3>
              <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800">
                {quote.activities.map(act => (
                  <div key={act.id} className="pt-3 flex items-start justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 block">{act.action}</span>
                      <p className="text-slate-600 dark:text-slate-400 mt-0.5">{act.details}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-slate-400 block">{act.timestamp}</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">{act.user} ({act.role})</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* 30% RIGHT STICKY INTELLIGENCE PANEL (4 cols out of 12) */}
        <div className="lg:col-span-4 space-y-6">
          {/* SIGNATURE COMPONENT: DealIntelligencePanel */}
          <DealIntelligencePanel
            quote={quote}
            onOpenApprovalModal={() => setIsApprovalModalOpen(true)}
          />

          {/* SIGNATURE COMPONENT: Sticky Financial Summary */}
          <QuoteSummaryCard quote={quote} onPreview={() => setIsPreviewOpen(true)} />
        </div>
      </div>

      {/* Customer Proposal Preview Modal */}
      <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title="Customer Proposal Preview" maxWidth="4xl">
        <div className="space-y-6 p-4 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-xl border">
          <div className="flex justify-between items-start border-b pb-4">
            <div>
              <h2 className="text-xl font-black text-blue-600">DEALFLOW360 PROPOSAL</h2>
              <span className="text-xs text-slate-500">Official Commercial Quote {quote.quoteNumber}</span>
            </div>
            <div className="text-right">
              <span className="font-bold block text-sm">{customer.name}</span>
              <span className="text-xs text-slate-500">{customer.address}</span>
            </div>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b bg-slate-50 dark:bg-slate-900 font-bold">
                <th className="p-2">Item</th>
                <th className="p-2 text-center">Qty</th>
                <th className="p-2 text-right">Unit Price</th>
                <th className="p-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {metrics.lineDetails.map(l => (
                <tr key={l.id}>
                  <td className="p-2 font-medium">{l.product.name}</td>
                  <td className="p-2 text-center">{l.qty}</td>
                  <td className="p-2 text-right">${l.unitPriceWithConfig.toLocaleString()}</td>
                  <td className="p-2 text-right font-bold">${l.finalLineTotal.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end pt-4 border-t text-sm font-black">
            <span>Total Value: ${metrics.contractValue.toLocaleString()}</span>
          </div>
        </div>
      </Modal>
    </div>
  );
}
