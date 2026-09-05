import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertCircle, User } from 'lucide-react';
import { ApprovalStep } from '../../types';
import { Badge } from '../ui';

interface ApprovalTimelineProps {
  history: ApprovalStep[];
}

export function ApprovalTimeline({ history }: ApprovalTimelineProps) {
  if (!history || history.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-[#1C1C1E] border border-white/8 text-xs text-[#A6A39C] text-center">
        No formal approval steps logged for this quotation yet.
      </div>
    );
  }

  return (
    <div className="space-y-4 relative">
      {history.map((step, idx) => {
        const isApproved = step.status === 'Approved';
        const isPending = step.status === 'Pending';
        const isRejected = step.status === 'Rejected';
        const isWaiting = step.status === 'Waiting';
        const isRevision = step.status === 'Revision Requested';

        let badgeVariant: any = 'default';
        if (isApproved) badgeVariant = 'success';
        else if (isPending) badgeVariant = 'primary';
        else if (isRejected) badgeVariant = 'danger';
        else if (isRevision) badgeVariant = 'warning';

        const iconBg = isApproved
          ? 'bg-emerald-600'
          : isPending
          ? 'bg-[#FF4A1C] ring-2 ring-[#FF4A1C]/30'
          : isRejected
          ? 'bg-rose-600'
          : isRevision
          ? 'bg-amber-600'
          : 'bg-[#2C2C2E]';

        return (
          <div key={step.id || idx} className="relative flex items-start gap-3.5">
            {/* Step Icon */}
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg z-10 ${iconBg}`}>
              {isApproved ? (
                <CheckCircle2 className="w-4.5 h-4.5" />
              ) : isPending ? (
                <Clock className="w-4.5 h-4.5 animate-pulse" />
              ) : isRejected ? (
                <XCircle className="w-4.5 h-4.5" />
              ) : isRevision ? (
                <AlertCircle className="w-4.5 h-4.5" />
              ) : (
                <User className="w-4 h-4 text-[#A6A39C]" />
              )}
            </div>

            {/* Connecting vertical line */}
            {idx < history.length - 1 && (
              <div className="absolute left-[17px] top-9 bottom-0 w-px bg-white/8 -mb-4 z-0" />
            )}

            {/* Content Card */}
            <div className="flex-1 bg-[#1C1C1E] border border-white/8 rounded-xl p-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-[#F5F1EA]">{step.name}</span>
                  <span className="text-[11px] text-[#A6A39C] font-medium">({step.role})</span>
                </div>
                <Badge variant={badgeVariant} size="sm">{step.status}</Badge>
              </div>

              {step.timestamp && (
                <span className="text-[10px] text-[#6E6C68] block mt-1 font-mono">
                  Logged: {step.timestamp}
                </span>
              )}

              {step.comment && (
                <div className="mt-2.5 p-2.5 rounded-lg bg-[#151517] border border-white/8 text-xs text-[#A6A39C] italic">
                  "{step.comment}"
                </div>
              )}

              {isWaiting && (
                <div className="mt-2 text-[10px] text-[#6E6C68] flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  <span>Awaiting previous approval step to unlock</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
