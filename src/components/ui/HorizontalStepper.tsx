import React from 'react';
import { Check, Clock, XCircle } from 'lucide-react';
import { cn } from './index';

export interface StepItem {
  id?: string;
  label: string;
  sublabel?: string;
  date?: string;
  status?: 'completed' | 'active' | 'pending' | 'rejected';
}

interface HorizontalStepperProps {
  steps: StepItem[];
  currentStep?: number;
  className?: string;
}

export function HorizontalStepper({ steps, currentStep, className }: HorizontalStepperProps) {
  return (
    <div className={cn('w-full bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-xl p-4 shadow-2xs overflow-x-auto', className)}>
      <div className="flex items-center justify-between relative min-w-[500px]">
        {/* Connector Line */}
        <div className="absolute left-6 right-6 top-4 h-0.5 bg-slate-200 dark:bg-slate-800 z-0" />

        {steps.map((step, idx) => {
          let isCompleted = step.status === 'completed';
          let isActive = step.status === 'active';
          let isRejected = step.status === 'rejected';

          if (currentStep !== undefined) {
            isCompleted = idx < currentStep;
            isActive = idx === currentStep;
            isRejected = false;
          }

          let stepBg = 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700';
          let textColor = 'text-slate-400';

          if (isCompleted) {
            stepBg = 'bg-[#059669] text-white border-[#059669]';
            textColor = 'text-[#059669] dark:text-emerald-400 font-semibold';
          } else if (isActive) {
            stepBg = 'bg-[#4F46E5] text-white border-[#4F46E5] ring-4 ring-indigo-100 dark:ring-indigo-950/60';
            textColor = 'text-[#4F46E5] dark:text-indigo-400 font-bold';
          } else if (isRejected) {
            stepBg = 'bg-[#DC2626] text-white border-[#DC2626] ring-4 ring-rose-100 dark:ring-rose-950/60';
            textColor = 'text-[#DC2626] dark:text-rose-400 font-bold';
          }

          return (
            <div key={step.id || idx} className="flex flex-col items-center z-10">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs transition-all shadow-2xs ${stepBg}`}>
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : isRejected ? (
                  <XCircle className="w-4 h-4" />
                ) : isActive ? (
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
              <span className={`text-[11px] mt-2 tracking-tight text-center ${textColor}`}>
                {step.label}
              </span>
              {(step.sublabel || step.date) && (
                <span className="text-[10px] text-slate-400 block">{step.sublabel || step.date}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

