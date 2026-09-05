import React from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert, XCircle } from 'lucide-react';
import { QuoteCalculations } from '../../utils/calculations';
import { Badge } from '../ui';

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
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200'
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200'
            }`}
          >
            {factor.severity === 'danger' ? (
              <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-semibold flex items-center justify-between">
                <span>{factor.title}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-white/60 dark:bg-slate-900/60">
                  +{factor.points} pts
                </span>
              </div>
              <p className="text-[11px] mt-0.5 leading-tight opacity-90">{factor.message}</p>
            </div>
          </div>
        ))
      )}

      {/* Summary Score Bar */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
        <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
          <span>Overall Deal Risk Index</span>
          <span>{metrics.riskScore} / 100</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              metrics.riskScore >= 60
                ? 'bg-rose-500'
                : metrics.riskScore >= 35
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${metrics.riskScore}%` }}
          />
        </div>
      </div>
    </div>
  );
}
