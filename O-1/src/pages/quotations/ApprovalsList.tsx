import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Filter,
  Search,
  Check,
  RotateCcw,
  UserCheck,
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { CUSTOMERS } from '../../data/mockData';
import { Badge, Button, Card, Modal } from '../../components/ui';
import { ApprovalPreview } from '../../components/approvals/ApprovalPreview';
import { ApprovalTimeline } from '../../components/approvals/ApprovalTimeline';
import { Quote } from '../../types';

export default function ApprovalsList() {
  const { quotes, currentUser, approveQuote, rejectQuote, requestRevision, setSelectedQuoteId, getQuoteMetrics } = useAppContext();
  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'history'>('pending');
  const [reviewingQuote, setReviewingQuote] = useState<Quote | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'revision' | null>(null);
  const [reasonInput, setReasonInput] = useState('');
  const navigate = useNavigate();

  const handleAction = () => {
    if (!reviewingQuote || !actionType) return;

    if (actionType === 'approve') {
      approveQuote(reviewingQuote.id, reasonInput || `Approved by ${currentUser.role}`);
    } else if (actionType === 'reject') {
      rejectQuote(reviewingQuote.id, reasonInput || 'Discount exceeds target profitability policy.');
    } else if (actionType === 'revision') {
      requestRevision(reviewingQuote.id, reasonInput || 'Please adjust Setup Service discount to maximum 10%.');
    }

    setReviewingQuote(null);
    setActionType(null);
    setReasonInput('');
  };

  const pendingQuotes = quotes.filter(q => q.status === 'Pending Approval');
  const displayQuotes = activeTab === 'pending' ? pendingQuotes : quotes;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Card */}
      <div className="bg-[#151517] border border-white/8 rounded-[20px] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-[#F5F1EA] tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-7 h-7 text-[#FF4A1C]" />
            Approval Workspace
          </h1>
          <p className="text-xs text-[#A6A39C] mt-1">
            Centralized governance center for sequential & parallel discount reviews
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-4 py-1.5 rounded-full bg-[#1C1C1E] border border-white/10 text-xs font-semibold text-[#F5F1EA] flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#FF4A1C]" />
            Reviewing as {currentUser.role}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/8 pb-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-full font-bold text-xs transition-all flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'bg-[#FF4A1C] text-white shadow-sm'
              : 'bg-[#151517] text-[#A6A39C] hover:text-[#F5F1EA] border border-white/8'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Pending My Approval ({pendingQuotes.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-full font-bold text-xs transition-all ${
            activeTab === 'all'
              ? 'bg-[#FF4A1C] text-white shadow-sm'
              : 'bg-[#151517] text-[#A6A39C] hover:text-[#F5F1EA] border border-white/8'
          }`}
        >
          All Approval Work Items ({quotes.length})
        </button>
      </div>

      {/* Approval Table */}
      <div className="bg-[#151517] border border-white/8 rounded-[20px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#121214] border-b border-white/8 text-[11px] font-semibold text-[#A6A39C] uppercase tracking-wider">
                <th className="py-3.5 px-5">Quote #</th>
                <th className="py-3.5 px-5">Customer</th>
                <th className="py-3.5 px-5 text-right">Contract Value</th>
                <th className="py-3.5 px-4 text-center">Risk Index</th>
                <th className="py-3.5 px-4">Submitted By</th>
                <th className="py-3.5 px-4">Approval Stage</th>
                <th className="py-3.5 px-5 text-center">Governance Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-[#F5F1EA]">
              {displayQuotes.map(q => {
                const metrics = getQuoteMetrics(q);
                const cust = CUSTOMERS.find(c => c.id === q.customerId);
                const riskVariant = metrics.riskLevel === 'HIGH' ? 'danger' : 'warning';

                return (
                  <tr key={q.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-5 font-bold text-[#FF7A45]">{q.quoteNumber}</td>
                    <td className="py-4 px-5">
                      <span className="font-bold text-[#F5F1EA] block">{cust?.name}</span>
                      <span className="text-[11px] text-[#A6A39C]">{q.opportunity}</span>
                    </td>
                    <td className="py-4 px-5 text-right font-black text-[#F5F1EA]">
                      ${metrics.contractValue.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Badge variant={riskVariant} size="sm">{metrics.riskScore}/100 ({metrics.riskLevel})</Badge>
                    </td>
                    <td className="py-4 px-4 font-medium text-[#A6A39C]">{q.owner}</td>
                    <td className="py-4 px-4">
                      <Badge variant={q.status === 'Approved' ? 'success' : 'primary'} size="sm">
                        {q.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setReviewingQuote(q);
                            setActionType('approve');
                          }}
                          className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold hover:bg-emerald-500/20 transition-all flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>

                        <button
                          onClick={() => {
                            setReviewingQuote(q);
                            setActionType('revision');
                          }}
                          className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#F5F1EA] font-semibold hover:bg-white/10 transition-all flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Revise</span>
                        </button>

                        <button
                          onClick={() => {
                            setReviewingQuote(q);
                            setActionType('reject');
                          }}
                          className="px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold hover:bg-rose-500/20 transition-all flex items-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review & Decision Modal */}
      {reviewingQuote && actionType && (
        <Modal
          isOpen={!!reviewingQuote}
          onClose={() => setReviewingQuote(null)}
          title={`Governance Action: ${actionType.toUpperCase()} (${reviewingQuote.quoteNumber})`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <ApprovalPreview quote={reviewingQuote} />

            <div>
              <label className="text-xs font-bold text-[#F5F1EA] uppercase tracking-wider block mb-1.5">
                {actionType === 'approve' ? 'Approval Note (Optional)' : actionType === 'reject' ? 'Rejection Reason (Required)' : 'Revision Instructions'}
              </label>
              <textarea
                value={reasonInput}
                onChange={e => setReasonInput(e.target.value)}
                placeholder={
                  actionType === 'approve'
                    ? 'Authorized terms based on Gold customer tier relationship...'
                    : actionType === 'reject'
                    ? 'Margin drops below acceptable threshold...'
                    : 'Please reduce Setup Service discount to 10%...'
                }
                rows={3}
                className="w-full p-3 bg-[#1C1C1E] border border-white/10 rounded-xl text-xs text-[#F5F1EA] placeholder-[#6E6C68] focus:outline-none focus:border-[#FF4A1C] transition-colors"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/8">
              <Button onClick={() => setReviewingQuote(null)} variant="secondary">Cancel</Button>
              <Button
                onClick={handleAction}
                variant={actionType === 'approve' ? 'success' : actionType === 'reject' ? 'danger' : 'primary'}
                className="font-bold"
              >
                Confirm {actionType.toUpperCase()}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
