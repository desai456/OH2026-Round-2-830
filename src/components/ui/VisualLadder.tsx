import React from 'react';
import { cn } from './index';

export interface LadderTier {
  id: string;
  name: string;
  limitPercent: number;
  maxPercent?: number;
  color?: string;
  tag?: string;
}

interface VisualLadderProps {
  title: string;
  subtitle?: string;
  tiers: LadderTier[];
  className?: string;
}

export function VisualLadder({ title, subtitle, tiers, className }: VisualLadderProps) {
  const maxLimit = Math.max(...tiers.map(t => t.limitPercent), 25);

  return (
    <div className={cn('bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-4', className)}>
      <div>
        <h3 className="font-bold text-xs text-[#0F172A] dark:text-slate-100 uppercase tracking-wider">{title}</h3>
        {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="space-y-3">
        {tiers.map(tier => {
          const widthPercent = (tier.limitPercent / maxLimit) * 100;
          return (
            <div key={tier.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 dark:text-slate-100">{tier.name}</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-[#4F46E5] dark:text-indigo-400">{tier.limitPercent}% Max Ceiling</span>
                  {tier.tag && <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">{tier.tag}</span>}
                </div>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-[#4F46E5] dark:bg-indigo-500 transition-all duration-500"
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
