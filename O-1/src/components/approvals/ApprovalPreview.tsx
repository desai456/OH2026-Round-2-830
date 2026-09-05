import React from 'react';
import { ArrowDown, Check, ShieldCheck, AlertTriangle, GitFork, UserCheck, DollarSign, Percent } from 'lucide-react';
import { Quote } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { Badge } from '../ui';

interface ApprovalPreviewProps {
  quote: Quote;
}

export function ApprovalPreview({ quote }: ApprovalPreviewProps) {
  const { getQuoteMetrics } = useAppContext();
  const metrics = getQuoteMetrics(quote);

  // Safely derive category violations from lineDetails
  const categoryViolations = metrics.lineDetails
    .filter(l => l.exceedsCategoryLimit)
    .map(l => `${l.product.name} (${l.discountPercent}% > ${l.categoryLimit}% cap)`);

  const riskVariant = metrics.riskLevel === 'HIGH' ? 'danger' : metrics.riskLevel === 'MEDIUM' ? 'warning' : 'success';

  return (
    <div className="bg-[#1C1C1E] text-[#F5F1EA] rounded-2xl p-5 border border-white/10 relative overflow-hidden space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/8">
        <div>
          <h3 className="font-bold text-sm text-[#F5F1EA] flex items-center gap-2">
            <GitFork className="w-4 h-4 text-[#FF4A1C]" />
            Governance Flow Preview
          </h3>
          <p className="text-[11px] text-[#A6A39C] mt-0.5">Dynamic approval chain for {quote.quoteNumber}</p>
        </div>
        <Badge variant={riskVariant}>
          {metrics.riskLevel} RISK · {metrics.riskScore}/100
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="bg-[#151517] border border-white/8 rounded-xl p-3 text-center">
          <DollarSign className="w-4 h-4 text-[#FF4A1C] mx-auto mb-1" />
          <span className="font-bold text-[#F5F1EA] block">${metrics.contractValue.toLocaleString()}</span>
          <span className="text-[10px] text-[#A6A39C]">Contract Value</span>
        </div>
        <div className="bg-[#151517] border border-white/8 rounded-xl p-3 text-center">
          <Percent className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
          <span className={`font-bold block ${metrics.marginPercent < 25 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {metrics.marginPercent.toFixed(1)}%
          </span>
          <span className="text-[10px] text-[#A6A39C]">Gross Margin</span>
        </div>
        <div className="bg-[#151517] border border-white/8 rounded-xl p-3 text-center">
          <AlertTriangle className="w-4 h-4 text-amber-400 mx-auto mb-1" />
          <span className="font-bold text-amber-400 block">{metrics.riskFactors.length}</span>
          <span className="text-[10px] text-[#A6A39C]">Risk Factors</span>
        </div>
      </div>

      {/* Approval Flow Nodes */}
      <div className="space-y-2">
        {/* Node 1: Submission */}
        <div className="bg-[#151517] border border-white/8 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold text-xs">
              Q
            </div>
            <div>
              <span className="text-xs font-bold text-[#F5F1EA] block">{quote.quoteNumber} · Submitted</span>
              <span className="text-[10px] text-[#A6A39C]">Owner: {quote.owner}</span>
            </div>
          </div>
          <Badge variant="info" size="sm">Initiated</Badge>
        </div>

        <div className="flex justify-center">
          <ArrowDown className="w-4 h-4 text-[#A6A39C] animate-bounce" />
        </div>

        {/* Node 2: Risk Engine */}
        <div className={`border rounded-xl p-3 ${categoryViolations.length > 0 || metrics.riskScore >= 60 ? 'bg-rose-500/5 border-rose-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-amber-200 block">Governance Rules Triggered</span>
              <span className="text-[10px] text-amber-300/80 break-words">
                {categoryViolations.length > 0
                  ? categoryViolations.join(' | ')
                  : metrics.riskFactors.length > 0
                    ? metrics.riskFactors[0].message
                    : 'Discount exceeds standard threshold'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <ArrowDown className="w-4 h-4 text-[#A6A39C]" />
        </div>

        {/* Node 3: Approval Steps */}
        <div className="grid grid-cols-2 gap-2">
          {/* Manager Step */}
          <div className={`border rounded-xl p-3 ${metrics.requiresManager ? 'bg-purple-500/5 border-purple-500/20' : 'bg-[#151517] border-white/8'}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-[#F5F1EA]">Sales Manager</span>
              <UserCheck className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <p className="text-[10px] text-[#A6A39C]">Sarah Vance</p>
            <div className="mt-2 pt-2 border-t border-white/8 flex items-center justify-between">
              <span className="text-[10px] text-[#A6A39C]">Step 1</span>
              <Badge variant={metrics.requiresManager ? 'warning' : 'default'} size="sm">
                {metrics.requiresManager ? 'Required' : 'Optional'}
              </Badge>
            </div>
          </div>

          {/* Finance Step */}
          <div className={`border rounded-xl p-3 ${metrics.requiresFinance ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-[#151517] border-white/8'}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-[#F5F1EA]">Finance</span>
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <p className="text-[10px] text-[#A6A39C]">Michael Sterling</p>
            <div className="mt-2 pt-2 border-t border-white/8 flex items-center justify-between">
              <span className="text-[10px] text-[#A6A39C]">Step 2</span>
              <Badge variant={metrics.requiresFinance ? 'danger' : 'default'} size="sm">
                {metrics.requiresFinance ? 'Required' : 'Skipped'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <ArrowDown className="w-4 h-4 text-[#A6A39C]" />
        </div>

        {/* Node 4: Final Outcome */}
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Check className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-200 block">Quote Approved & Locked</span>
              <span className="text-[10px] text-emerald-300/80">Ready for billing & fulfillment</span>
            </div>
          </div>
          <Badge variant="success" size="sm">Final</Badge>
        </div>
      </div>

      {/* Risk Factors List */}
      {metrics.riskFactors.length > 0 && (
        <div className="border-t border-white/8 pt-3 space-y-2">
          <span className="text-[10px] font-bold text-[#A6A39C] uppercase tracking-wider">Active Risk Factors</span>
          {metrics.riskFactors.slice(0, 3).map(rf => (
            <div key={rf.id} className={`flex items-start gap-2 p-2.5 rounded-lg text-[11px] ${rf.severity === 'danger' ? 'bg-rose-500/10 border border-rose-500/20 text-rose-300' : 'bg-amber-500/10 border border-amber-500/20 text-amber-300'}`}>
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>{rf.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
