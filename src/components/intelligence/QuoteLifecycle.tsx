import React from 'react';
import { Check, XCircle } from 'lucide-react';
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
    <div className="w-full bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-xl p-4 shadow-2xs overflow-x-auto">
      <div className="flex items-center min-w-[700px] justify-between relative">
        {/* Connector Bar Background */}
        <div className="absolute left-6 right-6 top-4 h-0.5 bg-[#E2E8F0] dark:bg-slate-800 z-0" />

        {stages.map((stage, idx) => {
          const isCompleted = idx < currentIndex && !isRejected;
          const isCurrent = idx === currentIndex;

          let stepBg = 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700';
          let textColor = 'text-slate-400 dark:text-slate-500';

          if (isCompleted) {
            stepBg = 'bg-[#059669] text-white border-[#059669]';
            textColor = 'text-[#059669] dark:text-emerald-400 font-semibold';
          } else if (isCurrent) {
            if (isRejected) {
              stepBg = 'bg-[#DC2626] text-white border-[#DC2626] ring-4 ring-rose-100 dark:ring-rose-950/60';
              textColor = 'text-[#DC2626] dark:text-rose-400 font-bold';
            } else {
              stepBg = 'bg-[#4F46E5] text-white border-[#4F46E5] ring-4 ring-indigo-100 dark:ring-indigo-950/60';
              textColor = 'text-[#4F46E5] dark:text-indigo-400 font-bold';
            }
          }

          return (
            <div key={stage} className="flex flex-col items-center z-10 group">
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs transition-all shadow-2xs ${stepBg}`}
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
