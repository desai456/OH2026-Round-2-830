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
    <div className={cn('bg-[#151517] text-[#F5F1EA] border border-white/8 rounded-[20px] p-5 shadow-xs space-y-4', className)}>
      <div>
        <h3 className="font-bold text-xs text-[#F5F1EA] uppercase tracking-wider">{title}</h3>
        {subtitle && <p className="text-[11px] text-[#A6A39C] mt-0.5">{subtitle}</p>}
      </div>

      <div className="space-y-3">
        {tiers.map(tier => {
          const widthPercent = (tier.limitPercent / maxLimit) * 100;
          return (
            <div key={tier.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#F5F1EA]">{tier.name}</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[#FF7A45]">{tier.limitPercent}% Max Ceiling</span>
                  {tier.tag && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#A6A39C]">{tier.tag}</span>}
                </div>
              </div>
              <div className="w-full h-3 rounded-full bg-white/5 border border-white/8 overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-[#FF4A1C] transition-all duration-500 shadow-sm"
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
