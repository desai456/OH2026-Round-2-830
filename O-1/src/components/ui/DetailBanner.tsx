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
    amber: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
    blue: 'bg-[#FF4A1C]/10 border-[#FF4A1C]/30 text-[#F5F1EA]',
    emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
  };

  const defaultIcons = {
    amber: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />,
    blue: <Info className="w-4 h-4 text-[#FF4A1C] shrink-0 mt-0.5" />,
    emerald: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />,
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

