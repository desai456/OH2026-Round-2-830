import React from 'react';
import { Send, Eye, Save, ArrowRight, ShieldCheck, DollarSign, Calculator } from 'lucide-react';
import { Quote } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { Badge, Button, Card } from '../ui';

interface QuoteSummaryCardProps {
  quote: Quote;
  onPreview?: () => void;
}

export function QuoteSummaryCard({ quote, onPreview }: QuoteSummaryCardProps) {
  const { getQuoteMetrics, submitForApproval } = useAppContext();
  const metrics = getQuoteMetrics(quote);

  return (
    <Card className="border-white/8 dark:border-white/8 shadow-md sticky top-20">
      <div className="flex items-center justify-between pb-3 border-b border-white/8 dark:border-white/8">
        <h3 className="font-bold text-sm text-[#F5F1EA] dark:text-[#F5F1EA] uppercase tracking-wider flex items-center gap-2">
          <Calculator className="w-4 h-4 text-blue-600" />
          Financial Summary
        </h3>
        <Badge variant="outline" size="sm">{quote.currency}</Badge>
      </div>

      <div className="py-4 space-y-3 text-xs border-b border-white/8 dark:border-white/8">
        <div className="flex justify-between text-[#A6A39C] dark:text-[#6E6C68]">
          <span>Catalog Subtotal</span>
          <span className="font-semibold text-[#F5F1EA] dark:text-[#F5F1EA]">${metrics.subtotal.toLocaleString()}</span>
        </div>

        <div className="flex justify-between text-amber-600 dark:text-amber-400">
          <span>Applied Discount</span>
          <span className="font-bold">-${metrics.totalDiscount.toLocaleString()}</span>
        </div>

        <div className="flex justify-between text-[#A6A39C] dark:text-[#6E6C68]">
          <span>Estimated Tax (5%)</span>
          <span className="font-semibold text-[#F5F1EA] dark:text-[#F5F1EA]">+${metrics.totalTax.toLocaleString()}</span>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-white/8/80 flex justify-between font-bold text-sm text-[#F5F1EA] dark:text-[#F5F1EA]">
          <span>One-Time Total</span>
          <span>${metrics.oneTimeTotal.toLocaleString()}</span>
        </div>

        {metrics.recurringMRR > 0 && (
          <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-1">
            <div className="flex justify-between text-blue-900 dark:text-blue-200 font-bold">
              <span>Recurring (MRR)</span>
              <span>${metrics.recurringMRR.toLocaleString()} / mo</span>
            </div>
            <div className="flex justify-between text-blue-700 dark:text-blue-300 text-[11px]">
              <span>Annualized ARR</span>
              <span>${metrics.recurringARR.toLocaleString()} / yr</span>
            </div>
          </div>
        )}
      </div>

      {/* Contract Value & Gross Margin Highlights */}
      <div className="py-4 space-y-3 border-b border-white/8 dark:border-white/8">
        <div className="p-3 rounded-xl bg-[#0E0E10] text-[#F5F1EA] dark:bg-[#1C1C1E] dark:text-[#F5F1EA] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E6C68] block">Total Contract Value</span>
            <span className="text-xl font-black text-white">${metrics.contractValue.toLocaleString()}</span>
          </div>
          <DollarSign className="w-6 h-6 text-emerald-400" />
        </div>

        <div className="flex justify-between items-center text-xs">
          <span className="text-[#A6A39C] font-medium">Estimated Gross Margin:</span>
          <div className="text-right">
            <span className="font-bold text-[#F5F1EA] dark:text-[#F5F1EA]">${metrics.grossMargin.toLocaleString()}</span>
            <span className={`ml-1.5 font-bold ${metrics.marginPercent < 25 ? 'text-rose-600' : 'text-emerald-600'}`}>
              ({metrics.marginPercent.toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 space-y-2">
        <Button
          onClick={() => submitForApproval(quote.id)}
          variant="primary"
          className="w-full font-bold shadow-xs py-2.5"
          disabled={quote.status === 'Pending Approval' || quote.status === 'Approved'}
        >
          <Send className="w-4 h-4" />
          <span>{quote.status === 'Pending Approval' ? 'Submitted for Approval' : 'Submit for Governance Approval'}</span>
        </Button>

        {onPreview && (
          <Button onClick={onPreview} variant="outline" className="w-full">
            <Eye className="w-4 h-4" />
            <span>Preview Customer Proposal</span>
          </Button>
        )}
      </div>
    </Card>
  );
}
