import React, { useState } from 'react';
import { ShieldAlert, ArrowRight, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { Quote } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { Badge, Button, Card } from '../ui';
import { RiskBreakdown } from './RiskBreakdown';

interface DealIntelligencePanelProps {
  quote: Quote;
  onOpenApprovalModal?: () => void;
}

export function DealIntelligencePanel({ quote, onOpenApprovalModal }: DealIntelligencePanelProps) {
  const { getQuoteMetrics } = useAppContext();
  const [isRiskExpanded, setIsRiskExpanded] = useState(true);

  const metrics = getQuoteMetrics(quote);

  const riskBadgeVariant = metrics.riskLevel === 'HIGH' ? 'danger' : metrics.riskLevel === 'MEDIUM' ? 'warning' : 'success';
  const marginBadgeVariant = metrics.marginHealth === 'HEALTHY' ? 'success' : metrics.marginHealth === 'WATCH' ? 'warning' : 'danger';

  return (
    <Card className="border-[#E2E8F0] dark:border-slate-800 shadow-2xs bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#4F46E5] dark:text-indigo-400" />
          <h3 className="font-bold text-xs text-[#0F172A] dark:text-slate-100 uppercase tracking-wider">
            Deal Governance Intelligence
          </h3>
        </div>
        <Badge variant="primary" size="sm">Self-Governing Engine</Badge>
      </div>

      {/* Main Indicators Grid */}
      <div className="grid grid-cols-2 gap-3 py-4 border-b border-[#E2E8F0] dark:border-slate-800">
        {/* Risk Card */}
        <div className="p-3 rounded-lg bg-[#F8FAFC] dark:bg-slate-800/60 border border-[#E2E8F0] dark:border-slate-700 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Risk Score</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-black text-[#0F172A] dark:text-slate-100">{metrics.riskScore}<span className="text-xs text-slate-400 font-normal">/100</span></span>
            <Badge variant={riskBadgeVariant} size="sm">{metrics.riskLevel}</Badge>
          </div>
        </div>

        {/* Margin Card */}
        <div className="p-3 rounded-lg bg-[#F8FAFC] dark:bg-slate-800/60 border border-[#E2E8F0] dark:border-slate-700 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Gross Margin</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-black text-[#0F172A] dark:text-slate-100">{metrics.marginPercent.toFixed(1)}%</span>
            <Badge variant={marginBadgeVariant} size="sm">{metrics.marginHealth}</Badge>
          </div>
        </div>
      </div>

      {/* Next Action & Governance Callout */}
      <div className="py-4 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Approval Status:</span>
          <span className="font-bold text-[#0F172A] dark:text-slate-200">
            {metrics.approvalRequired ? (metrics.requiresFinance ? 'Manager + Finance Required' : 'Manager Required') : 'No Approval Needed'}
          </span>
        </div>

        <div className="p-3 rounded-lg bg-[#EEF2FF] dark:bg-indigo-950/40 border border-[#C7D2FE] dark:border-indigo-800 text-xs">
          <div className="font-bold text-[#312E81] dark:text-indigo-200 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-[#4F46E5] shrink-0" />
            Recommended Next Action:
          </div>
          <p className="text-[#475569] dark:text-slate-300 mt-1 leading-relaxed text-[11px]">
            {quote.status === 'Pending Approval'
              ? `Review approval work items for ${metrics.requiresFinance ? 'Finance & Manager' : 'Manager'} authorization.`
              : quote.status === 'Draft'
              ? metrics.approvalRequired
                ? 'Submit quotation for governance approval review.'
                : 'Quote is within policy. Ready to send to customer.'
              : `Quote status is currently ${quote.status}. Proceed with next workflow step.`}
          </p>
        </div>

        {onOpenApprovalModal && metrics.approvalRequired && (
          <Button onClick={onOpenApprovalModal} variant="primary" className="w-full text-xs font-bold py-2">
            <span>View Approval Chain</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Accordion Toggle for Detailed Risk Factors */}
      <div className="pt-2 border-t border-[#E2E8F0] dark:border-slate-800">
        <button
          onClick={() => setIsRiskExpanded(!isRiskExpanded)}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 py-1 hover:text-[#4F46E5] transition-colors"
        >
          <span>Risk Factor Breakdown ({metrics.riskFactors.length})</span>
          {isRiskExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {isRiskExpanded && (
          <div className="mt-2">
            <RiskBreakdown metrics={metrics} />
          </div>
        )}
      </div>
    </Card>
  );
}
