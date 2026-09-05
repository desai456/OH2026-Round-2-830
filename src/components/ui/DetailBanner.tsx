import React from 'react';
import { Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from './index';

interface DetailBannerProps {
  message?: string;
  title?: string;
  type?: 'info' | 'warning' | 'success' | string;
  variant?: 'amber' | 'blue' | 'emerald';
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function DetailBanner({
  message,
  title,
  type = 'info',
  variant,
  icon,
  action,
  children,
  className,
}: DetailBannerProps) {
  const effectiveVariant = variant || (type === 'warning' ? 'amber' : type === 'success' ? 'emerald' : 'blue');

  const styles = {
    amber: 'bg-[#FFFBEB] dark:bg-amber-950/40 border-[#FDE68A] dark:border-amber-900/60 text-[#92400E] dark:text-amber-200',
    blue: 'bg-[#EEF2FF] dark:bg-indigo-950/40 border-[#C7D2FE] dark:border-indigo-900/60 text-[#312E81] dark:text-indigo-200',
    emerald: 'bg-[#ECFDF5] dark:bg-emerald-950/40 border-[#A7F3D0] dark:border-emerald-900/60 text-[#065F46] dark:text-emerald-200',
  };

  const defaultIcons = {
    amber: <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />,
    blue: <Info className="w-4 h-4 text-[#4F46E5] shrink-0 mt-0.5" />,
    emerald: <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />,
  };

  return (
    <div className={cn('p-3.5 rounded-xl border flex items-start justify-between gap-3 text-xs shadow-2xs', styles[effectiveVariant], className)}>
      <div className="flex items-start gap-2.5">
        {icon || defaultIcons[effectiveVariant]}
        <div>
          {title && <div className="font-bold text-xs mb-0.5">{title}</div>}
          <div className="font-medium leading-relaxed">{children || message}</div>
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

