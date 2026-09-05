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
      <div className="bg-[#151517] border border-white/8 rounded-[20px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF4A1C] to-[#E03A0E] text-white font-black text-xl flex items-center justify-center shadow-md shrink-0">
            Q
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-serif tracking-tight text-[#F5F1EA]">{quote.quoteNumber}</h1>
              <Badge variant="primary" size="md">{customer.name}</Badge>
              <Badge variant={quote.status === 'Approved' ? 'success' : quote.status === 'Pending Approval' ? 'warning' : 'default'}>
                {quote.status}
              </Badge>
            </div>
            <p className="text-xs text-[#A6A39C] mt-1 flex items-center gap-2">
              <span>Opportunity: <strong className="text-[#F5F1EA] font-semibold">{quote.opportunity}</strong></span>
              <span>•</span>
              <span>Owner: <strong className="text-[#F5F1EA] font-semibold">{quote.owner}</strong></span>
            </p>
          </div>
        </div>

        {/* Top Hero Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="px-4 py-2 text-xs font-semibold rounded-full border border-white/10 text-[#F5F1EA] hover:bg-white/5 transition-all flex items-center gap-2"
          >
            <Eye className="w-4 h-4 text-[#A6A39C]" />
            <span>Preview Proposal</span>
          </button>
          <button
            onClick={() => {
              if (quote.status === 'Confirmed') navigate(`/fulfillment/${quote.id}`);
              else navigate('/approvals');
            }}
            className="px-5 py-2 text-xs font-bold rounded-full bg-[#F5F1EA] text-[#0A0A0B] hover:bg-white transition-all flex items-center gap-2 shadow-sm"
          >
            <span>{quote.status === 'Confirmed' ? 'Proceed to Fulfillment' : 'View Approval Workspace'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quote Lifecycle Tracker */}
      <QuoteLifecycle currentStatus={quote.status} />

      {/* MAIN LAYOUT: 70% LEFT CONTENT | 30% RIGHT STICKY INTELLIGENCE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 70% MAIN CONTENT COLUMN (8 cols out of 12) */}
        <div className="lg:col-span-8 space-y-6">
          {/* CUSTOMER & ACCOUNT CONTEXT CARD */}
          <div className="bg-[#151517] border border-white/8 rounded-[20px] p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/8">
              <h3 className="font-semibold text-xs text-[#F5F1EA] uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#FF4A1C]" />
                Customer & Price Book Context
              </h3>
              <Badge variant="warning" size="sm">{customer.tier} Tier Account</Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[#A6A39C] block font-medium">Customer Account</span>
                <span className="font-bold text-[#F5F1EA] block text-sm mt-0.5">{customer.name}</span>
              </div>
              <div>
                <span className="text-[#A6A39C] block font-medium">Account Manager</span>
                <span className="font-bold text-[#F5F1EA] block text-sm mt-0.5">{customer.accountManager}</span>
              </div>
              <div>
                <span className="text-[#A6A39C] block font-medium">Price Book</span>
                <select
                  value={quote.priceBook}
                  onChange={e => updateQuote(quote.id, { priceBook: e.target.value })}
                  className="mt-1 py-1 px-2 bg-[#1C1C1E] border border-white/10 rounded-lg font-semibold text-xs text-[#F5F1EA] focus:outline-none focus:border-[#FF4A1C]"
                >
                  {PRICE_BOOKS.map(pb => (
                    <option key={pb.id} value={pb.name}>{pb.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <span className="text-[#A6A39C] block font-medium">Currency</span>
                <span className="font-bold text-[#F5F1EA] block text-sm mt-0.5">{quote.currency}</span>
              </div>
            </div>
          </div>

          {/* MAIN TABS: Line Editor | Approval Flow | Audit Activity */}
          <div className="flex items-center gap-2 border-b border-white/8 pb-2">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-4 py-2 rounded-full font-bold text-xs transition-all flex items-center gap-2 ${
                activeTab === 'editor'
                  ? 'bg-[#FF4A1C] text-white shadow-sm'
                  : 'bg-[#151517] text-[#A6A39C] hover:text-[#F5F1EA] border border-white/8'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Quote Line Editor</span>
            </button>
            <button
              onClick={() => setActiveTab('approvals')}
              className={`px-4 py-2 rounded-full font-bold text-xs transition-all flex items-center gap-2 ${
                activeTab === 'approvals'
                  ? 'bg-[#FF4A1C] text-white shadow-sm'
                  : 'bg-[#151517] text-[#A6A39C] hover:text-[#F5F1EA] border border-white/8'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Approval Flow & Diagram</span>
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-4 py-2 rounded-full font-bold text-xs transition-all flex items-center gap-2 ${
                activeTab === 'activity'
                  ? 'bg-[#FF4A1C] text-white shadow-sm'
                  : 'bg-[#151517] text-[#A6A39C] hover:text-[#F5F1EA] border border-white/8'
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
                <h3 className="font-bold text-sm text-[#F5F1EA] dark:text-[#F5F1EA] uppercase tracking-wider mb-4">
                  Approval Step Log
                </h3>
                <ApprovalTimeline history={quote.approvalHistory} />
              </Card>
            </div>
          )}

          {/* TAB 3: Activity & Audit Trail */}
          {activeTab === 'activity' && (
            <Card className="space-y-4">
              <h3 className="font-bold text-sm text-[#F5F1EA] dark:text-[#F5F1EA] uppercase tracking-wider">
                Full Quotation Audit Log
              </h3>
              <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800">
                {quote.activities.map(act => (
                  <div key={act.id} className="pt-3 flex items-start justify-between text-xs">
                    <div>
                      <span className="font-bold text-[#F5F1EA] dark:text-[#F5F1EA] block">{act.action}</span>
                      <p className="text-[#A6A39C] dark:text-[#6E6C68] mt-0.5">{act.details}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[#6E6C68] block">{act.timestamp}</span>
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
        <div className="space-y-6 p-4 bg-white  text-[#F5F1EA] dark:text-[#F5F1EA] rounded-xl border">
          <div className="flex justify-between items-start border-b pb-4">
            <div>
              <h2 className="text-xl font-black text-blue-600">DEALFLOW360 PROPOSAL</h2>
              <span className="text-xs text-[#A6A39C]">Official Commercial Quote {quote.quoteNumber}</span>
            </div>
            <div className="text-right">
              <span className="font-bold block text-sm">{customer.name}</span>
              <span className="text-xs text-[#A6A39C]">{customer.address}</span>
            </div>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b bg-[#1C1C1E] dark:bg-[#0E0E10] font-bold">
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
