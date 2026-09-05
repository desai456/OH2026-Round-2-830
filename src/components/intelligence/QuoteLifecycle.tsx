import React from 'react';
import { Check, Clock, AlertCircle, XCircle } from 'lucide-react';
import { QuoteStatus } from '../../types';

interface QuoteLifecycleProps {
  currentStatus: QuoteStatus;
}

export function QuoteLifecycle({ currentStatus }: QuoteLifecycleProps) {
  const stages: QuoteStatus[] = [
    'Draft',
    'Sent',
    'Under Negotiation',
    'Pending Approval',
    'Approved',
    'Confirmed',
    'Fulfillment',
    'Invoiced',
    'Paid',
  ];

  const getStageIndex = (status: QuoteStatus) => {
    if (status === 'Rejected') return stages.indexOf('Pending Approval');
    return stages.indexOf(status);
  };

  const currentIndex = getStageIndex(currentStatus);
  const isRejected = currentStatus === 'Rejected';

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-xs overflow-x-auto">
      <div className="flex items-center min-w-[700px] justify-between relative">
        {/* Connector Bar Background */}
        <div className="absolute left-6 right-6 top-4 h-0.5 bg-slate-200 dark:bg-slate-800 z-0" />

        {stages.map((stage, idx) => {
          const isCompleted = idx < currentIndex && !isRejected;
          const isCurrent = idx === currentIndex;
          const isFuture = idx > currentIndex;

          let stepBg = 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700';
          let textColor = 'text-slate-400 dark:text-slate-500';

          if (isCompleted) {
            stepBg = 'bg-emerald-600 text-white border-emerald-600';
            textColor = 'text-emerald-700 dark:text-emerald-400 font-semibold';
          } else if (isCurrent) {
            if (isRejected) {
              stepBg = 'bg-rose-600 text-white border-rose-600 ring-4 ring-rose-100 dark:ring-rose-950/60';
              textColor = 'text-rose-600 dark:text-rose-400 font-bold';
            } else {
              stepBg = 'bg-blue-600 text-white border-blue-600 ring-4 ring-blue-100 dark:ring-blue-950/60';
              textColor = 'text-blue-600 dark:text-blue-400 font-bold';
            }
          }

          return (
            <div key={stage} className="flex flex-col items-center z-10 group">
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs transition-all shadow-xs ${stepBg}`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : isCurrent && isRejected ? (
                  <XCircle className="w-4 h-4" />
                ) : isCurrent ? (
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
              <span className={`text-[11px] mt-2 tracking-tight text-center ${textColor}`}>
                {isCurrent && isRejected ? 'Rejected' : stage}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
