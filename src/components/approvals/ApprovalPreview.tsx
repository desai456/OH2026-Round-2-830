import React from 'react';
import { ArrowDown, Check, ShieldCheck, AlertTriangle, GitFork, UserCheck } from 'lucide-react';
import { Quote } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { Badge } from '../ui';

interface ApprovalPreviewProps {
  quote: Quote;
}

export function ApprovalPreview({ quote }: ApprovalPreviewProps) {
  const { getQuoteMetrics } = useAppContext();
  const metrics = getQuoteMetrics(quote);

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
      {/* Background Accent Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

      <div className="flex items-center justify-between pb-4 border-b border-slate-800 relative z-10">
        <div>
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <GitFork className="w-5 h-5 text-blue-400" />
            Visual Approval Flow Preview
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Dynamic rule branch graph for {quote.quoteNumber}</p>
        </div>
        <Badge variant={metrics.riskLevel === 'HIGH' ? 'danger' : 'warning'}>
          {metrics.riskLevel} RISK (Score: {metrics.riskScore})
        </Badge>
      </div>

      {/* Interactive Flowchart Diagram */}
      <div className="py-8 flex flex-col items-center gap-4 relative z-10 max-w-lg mx-auto">
        {/* Node 1: Quote Created */}
        <div className="w-full bg-slate-800/90 border border-slate-700 rounded-xl p-3.5 flex items-center justify-between shadow-lg backdrop-blur-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center font-bold text-xs">
              Q
            </div>
            <div>
              <span className="text-xs font-bold text-white block">{quote.quoteNumber} Created</span>
              <span className="text-[10px] text-slate-400">Total: ${metrics.contractValue.toLocaleString()}</span>
            </div>
          </div>
          <Badge variant="info" size="sm">Initiated</Badge>
        </div>

        <ArrowDown className="w-5 h-5 text-slate-500 animate-bounce" />

        {/* Node 2: Governance Condition Check */}
        <div className="w-full bg-amber-950/40 border border-amber-500/40 rounded-xl p-3.5 shadow-lg backdrop-blur-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-600/30 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <span className="text-xs font-bold text-amber-200 block">Governance Rules Triggered</span>
              <span className="text-[10px] text-amber-300/80 block mt-0.5">
                {metrics.categoryViolations.length > 0 ? metrics.categoryViolations.join(' | ') : 'Discount > 15% threshold'}
              </span>
            </div>
          </div>
        </div>

        <ArrowDown className="w-5 h-5 text-slate-500" />

        {/* Node 3: Sequential / Parallel Approvals */}
        <div className="w-full grid grid-cols-2 gap-3">
          {/* Manager Step */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-3 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-300">Sales Manager</span>
              <UserCheck className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-[10px] text-slate-400">Sarah Vance</p>
            <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Step 1</span>
              <Badge variant="primary" size="sm">Manager Review</Badge>
            </div>
          </div>

          {/* Finance Step */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-3 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-300">Finance Ops</span>
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-[10px] text-slate-400">Michael Sterling</p>
            <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Step 2</span>
              <Badge variant={metrics.requiresFinance ? 'warning' : 'default'} size="sm">
                {metrics.requiresFinance ? 'Required' : 'Optional'}
              </Badge>
            </div>
          </div>
        </div>

        <ArrowDown className="w-5 h-5 text-slate-500" />

        {/* Node 4: Final Outcome */}
        <div className="w-full bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3.5 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-200 block">Quote Approved & Locked</span>
              <span className="text-[10px] text-emerald-300/80">Ready for customer confirmation & billing</span>
            </div>
          </div>
          <Badge variant="success" size="sm">Approved</Badge>
        </div>
      </div>
    </div>
  );
}
