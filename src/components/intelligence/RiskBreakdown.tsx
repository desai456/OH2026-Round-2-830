import React from 'react';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { QuoteCalculations } from '../../utils/calculations';

interface RiskBreakdownProps {
  metrics: QuoteCalculations;
}

export function RiskBreakdown({ metrics }: RiskBreakdownProps) {
  return (
    <div className="space-y-2.5 text-xs">
      {/* Risk Factors List */}
      {metrics.riskFactors.length === 0 ? (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>All line items & margins conform strictly to corporate governance rules.</span>
        </div>
      ) : (
        metrics.riskFactors.map(factor => (
          <div
            key={factor.id}
            className={`p-2.5 rounded-lg border flex items-start gap-2.5 ${
              factor.severity === 'danger'
                ? 'bg-[#FEF2F2] dark:bg-rose-950/40 border-[#FECACA] dark:border-rose-900/60 text-[#991B1B] dark:text-rose-200'
                : 'bg-[#FFFBEB] dark:bg-amber-950/40 border-[#FDE68A] dark:border-amber-900/60 text-[#92400E] dark:text-amber-200'
            }`}
          >
            {factor.severity === 'danger' ? (
              <XCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-bold flex items-center justify-between">
                <span>{factor.title}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-white/80 dark:bg-slate-900/60">
                  +{factor.points} pts
                </span>
              </div>
              <p className="text-[11px] mt-0.5 leading-tight opacity-90">{factor.message}</p>
            </div>
          </div>
        ))
      )}

      {/* Summary Score Bar */}
      <div className="pt-2 border-t border-[#E2E8F0] dark:border-slate-800">
        <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
          <span>Overall Deal Risk Index</span>
          <span className="font-bold text-[#0F172A] dark:text-slate-200">{metrics.riskScore} / 100</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              metrics.riskScore >= 60
                ? 'bg-[#DC2626]'
                : metrics.riskScore >= 35
                ? 'bg-[#D97706]'
                : 'bg-[#059669]'
            }`}
            style={{ width: `${metrics.riskScore}%` }}
          />
        </div>
      </div>
    </div>
  );
}
