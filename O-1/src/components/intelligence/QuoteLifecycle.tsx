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
    <div className="w-full bg-[#151517] text-[#F5F1EA] border border-white/8 rounded-[20px] p-6 shadow-xs overflow-x-auto scrollbar-none">
      <div className="flex items-center min-w-[700px] justify-between relative">
        {/* Connector Bar Background */}
        <div className="absolute left-6 right-6 top-4 h-0.5 bg-white/10 z-0" />

        {stages.map((stage, idx) => {
          const isCompleted = idx < currentIndex && !isRejected;
          const isCurrent = idx === currentIndex;

          let stepBg = 'bg-white/5 text-[#A6A39C] border-white/10';
          let textColor = 'text-[#A6A39C]';

          if (isCompleted) {
            stepBg = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
            textColor = 'text-emerald-400 font-semibold';
          } else if (isCurrent) {
            if (isRejected) {
              stepBg = 'bg-rose-500/20 text-rose-400 border-rose-500/40 ring-4 ring-rose-500/20';
              textColor = 'text-rose-400 font-bold';
            } else {
              stepBg = 'bg-[#FF4A1C] text-white border-[#FF4A1C] ring-4 ring-[#FF4A1C]/20 shadow-sm';
              textColor = 'text-[#FF7A45] font-bold';
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
