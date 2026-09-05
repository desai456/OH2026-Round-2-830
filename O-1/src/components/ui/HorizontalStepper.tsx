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
    <div className={cn('w-full bg-[#151517] border border-white/8 rounded-[20px] p-6 shadow-xs overflow-x-auto', className)}>
      <div className="flex items-center justify-between relative min-w-[500px]">
        {/* Connector Line */}
        <div className="absolute left-6 right-6 top-4 h-0.5 bg-white/10 z-0" />

        {steps.map((step, idx) => {
          let isCompleted = step.status === 'completed';
          let isActive = step.status === 'active';
          let isRejected = step.status === 'rejected';

          if (currentStep !== undefined) {
            isCompleted = idx < currentStep;
            isActive = idx === currentStep;
            isRejected = false;
          }

          let stepBg = 'bg-white/5 text-[#A6A39C] border-white/10';
          let textColor = 'text-[#A6A39C]';

          if (isCompleted) {
            stepBg = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
            textColor = 'text-emerald-400 font-semibold';
          } else if (isActive) {
            stepBg = 'bg-[#FF4A1C] text-white border-[#FF4A1C] ring-4 ring-[#FF4A1C]/20';
            textColor = 'text-[#FF7A45] font-bold';
          } else if (isRejected) {
            stepBg = 'bg-rose-500/20 text-rose-400 border-rose-500/40 ring-4 ring-rose-500/20';
            textColor = 'text-rose-400 font-bold';
          }

          return (
            <div key={step.id || idx} className="flex flex-col items-center z-10">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs transition-all shadow-xs ${stepBg}`}>
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
                <span className="text-[10px] text-[#A6A39C] block">{step.sublabel || step.date}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

