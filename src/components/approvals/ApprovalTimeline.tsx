import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertCircle, User, ArrowDown } from 'lucide-react';
import { ApprovalStep } from '../../types';
import { Badge } from '../ui';

interface ApprovalTimelineProps {
  history: ApprovalStep[];
}

export function ApprovalTimeline({ history }: ApprovalTimelineProps) {
  if (!history || history.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 text-center">
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

        return (
          <div key={step.id || idx} className="relative flex items-start gap-3.5 group">
            {/* Step Icon */}
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 shadow-xs z-10 ${
                isApproved
                  ? 'bg-emerald-600'
                  : isPending
                  ? 'bg-blue-600 ring-4 ring-blue-100 dark:ring-blue-950/60'
                  : isRejected
                  ? 'bg-rose-600'
                  : isRevision
                  ? 'bg-amber-600'
                  : 'bg-slate-300 dark:bg-slate-700 text-slate-500'
              }`}
            >
              {isApproved ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : isPending ? (
                <Clock className="w-5 h-5 animate-pulse" />
              ) : isRejected ? (
                <XCircle className="w-5 h-5" />
              ) : isRevision ? (
                <AlertCircle className="w-5 h-5" />
              ) : (
                <User className="w-4 h-4 text-slate-500" />
              )}
            </div>

            {/* Connecting line */}
            {idx < history.length - 1 && (
              <div className="absolute left-4.5 top-9 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-800 -mb-4 z-0" />
            )}

            {/* Content Card */}
            <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{step.name}</span>
                  <span className="text-xs text-slate-400 font-medium">({step.role})</span>
                </div>
                <Badge variant={badgeVariant} size="sm">{step.status}</Badge>
              </div>

              {step.timestamp && (
                <span className="text-[11px] text-slate-400 block mt-1">Logged: {step.timestamp}</span>
              )}

              {step.comment && (
                <div className="mt-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 font-medium">
                  "{step.comment}"
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
