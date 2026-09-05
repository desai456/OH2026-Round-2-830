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
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>All line items & margins conform strictly to corporate governance rules.</span>
        </div>
      ) : (
        metrics.riskFactors.map(factor => (
          <div
            key={factor.id}
            className={`p-3 rounded-xl border flex items-start gap-2.5 ${
              factor.severity === 'danger'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
          >
            {factor.severity === 'danger' ? (
              <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-bold flex items-center justify-between">
                <span>{factor.title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-black/40 text-white">
                  +{factor.points} pts
                </span>
              </div>
              <p className="text-[11px] mt-0.5 leading-tight opacity-90">{factor.message}</p>
            </div>
          </div>
        ))
      )}

      {/* Summary Score Bar */}
      <div className="pt-3 border-t border-white/8">
        <div className="flex justify-between text-[11px] font-semibold text-[#A6A39C] mb-1.5">
          <span>Overall Deal Risk Index</span>
          <span className="font-bold text-[#F5F1EA]">{metrics.riskScore} / 100</span>
        </div>
        <div className="w-full h-2 rounded-full bg-white/5 border border-white/8 overflow-hidden">
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
