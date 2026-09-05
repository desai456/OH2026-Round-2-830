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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-blue-600" />
            Approval Workspace
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Centralized governance center for sequential & parallel discount reviews
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="primary" size="lg" className="font-bold">
            <UserCheck className="w-4 h-4" />
            Reviewing as {currentUser.role}
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Pending My Approval ({pendingQuotes.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All Approval Work Items ({quotes.length})
        </button>
      </div>

      {/* Approval Table */}
      <Card className="p-0 overflow-hidden border-slate-200/80 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Quote #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4 text-right">Contract Value</th>
                <th className="py-3 px-3 text-center">Risk Index</th>
                <th className="py-3 px-3">Submitted By</th>
                <th className="py-3 px-3">Approval Stage</th>
                <th className="py-3 px-4 text-center">Governance Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {displayQuotes.map(q => {
                const metrics = getQuoteMetrics(q);
                const cust = CUSTOMERS.find(c => c.id === q.customerId);
                const riskVariant = metrics.riskLevel === 'HIGH' ? 'danger' : 'warning';

                return (
                  <tr key={q.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-blue-600 dark:text-blue-400">{q.quoteNumber}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 dark:text-slate-100 block">{cust?.name}</span>
                      <span className="text-[11px] text-slate-400">{q.opportunity}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-slate-900 dark:text-slate-100">
                      ${metrics.contractValue.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <Badge variant={riskVariant} size="sm">{metrics.riskScore}/100 ({metrics.riskLevel})</Badge>
                    </td>
                    <td className="py-3.5 px-3 font-medium text-slate-700 dark:text-slate-300">{q.owner}</td>
                    <td className="py-3.5 px-3">
                      <Badge variant={q.status === 'Approved' ? 'success' : 'primary'} size="sm">
                        {q.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          onClick={() => {
                            setReviewingQuote(q);
                            setActionType('approve');
                          }}
                          variant="success"
                          size="sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </Button>

                        <Button
                          onClick={() => {
                            setReviewingQuote(q);
                            setActionType('revision');
                          }}
                          variant="outline"
                          size="sm"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Revise</span>
                        </Button>

                        <Button
                          onClick={() => {
                            setReviewingQuote(q);
                            setActionType('reject');
                          }}
                          variant="danger"
                          size="sm"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

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
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
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
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
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
