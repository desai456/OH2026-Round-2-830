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
    <Card className="bg-[#151517] text-[#F5F1EA] border border-white/8 rounded-[20px] shadow-xs p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/8">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#FF4A1C]" />
          <h3 className="font-bold text-xs text-[#F5F1EA] uppercase tracking-wider font-serif">
            Deal Governance Intelligence
          </h3>
        </div>
        <Badge variant="primary" size="sm">Self-Governing Engine</Badge>
      </div>

      {/* Main Indicators Grid */}
      <div className="grid grid-cols-2 gap-3 py-1 border-b border-white/8">
        {/* Risk Card */}
        <div className="p-3.5 rounded-[16px] bg-[#1C1C1E] border border-white/8 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-[#A6A39C] uppercase tracking-wider">Risk Score</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-[#F5F1EA] font-serif">{metrics.riskScore}<span className="text-xs text-[#A6A39C] font-normal">/100</span></span>
            <Badge variant={riskBadgeVariant} size="sm">{metrics.riskLevel}</Badge>
          </div>
        </div>

        {/* Margin Card */}
        <div className="p-3.5 rounded-[16px] bg-[#1C1C1E] border border-white/8 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-[#A6A39C] uppercase tracking-wider">Gross Margin</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-[#F5F1EA] font-serif">{metrics.marginPercent.toFixed(1)}%</span>
            <Badge variant={marginBadgeVariant} size="sm">{metrics.marginHealth}</Badge>
          </div>
        </div>
      </div>

      {/* Next Action & Governance Callout */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#A6A39C] font-medium">Approval Status:</span>
          <span className="font-bold text-[#F5F1EA]">
            {metrics.approvalRequired ? (metrics.requiresFinance ? 'Manager + Finance Required' : 'Manager Required') : 'No Approval Needed'}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs">
          <div className="font-bold text-[#F5F1EA] flex items-center gap-1.5">
            <Info className="w-4 h-4 text-[#FF4A1C] shrink-0" />
            Recommended Next Action:
          </div>
          <p className="text-[#A6A39C] mt-1 leading-relaxed text-[11px]">
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
          <Button onClick={onOpenApprovalModal} variant="primary" className="w-full text-xs font-semibold py-2.5 rounded-full">
            <span>View Approval Chain</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Accordion Toggle for Detailed Risk Factors */}
      <div className="pt-2 border-t border-[#E2E8F0] dark:border-white/8">
        <button
          onClick={() => setIsRiskExpanded(!isRiskExpanded)}
          className="w-full flex items-center justify-between text-xs font-bold text-[#A6A39C] dark:text-[#F5F1EA] py-1 hover:text-[#4F46E5] transition-colors"
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
