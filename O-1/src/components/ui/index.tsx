import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export * from './DetailBanner';
export * from './StatusTabs';
export * from './HorizontalStepper';
export * from './VisualLadder';

// Badge
export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  children?: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  size?: 'sm' | 'md' | 'lg';
};

export function Badge({ children, variant = 'default', size = 'md', className, ...props }: BadgeProps) {
  const base = 'inline-flex items-center font-medium rounded-full transition-colors border';

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-xs font-semibold gap-1.5',
  };

  const variants = {
    default: 'bg-white/5 text-[#A6A39C] border-white/10',
    primary: 'bg-[#FF4A1C]/10 text-[#FF7A45] border-[#FF4A1C]/30',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    info: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    outline: 'border-white/14 text-[#F5F1EA] bg-transparent',
  };

  return (
    <span className={cn(base, sizes[size], variants[variant], className)} {...props}>
      {children}
    </span>
  );
}

// Button
export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'ghost' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-medium rounded-full transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#FF7A45]/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs font-medium gap-1.5',
    md: 'px-5 py-2.5 text-xs font-semibold gap-2',
    lg: 'px-6 py-3 text-sm font-semibold gap-2.5',
  };

  const variants = {
    primary: 'bg-[#F5F1EA] hover:opacity-90 text-[#0A0A0B] shadow-sm hover:-translate-y-0.5 font-semibold',
    secondary: 'bg-transparent text-[#F5F1EA] border border-white/14 hover:border-white/30 hover:bg-white/5',
    accent: 'bg-[#FF4A1C] hover:bg-[#FF7A45] text-[#F5F1EA] shadow-md shadow-[#FF4A1C]/25 hover:-translate-y-0.5',
    outline: 'border border-white/14 hover:border-white/30 text-[#F5F1EA] hover:bg-white/5',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-xs',
    success: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs',
    ghost: 'text-[#A6A39C] hover:text-[#F5F1EA] hover:bg-white/5',
  };

  return (
    <button
      className={cn(base, sizes[size], variants[variant], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
}

// Card
export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  children?: React.ReactNode;
};

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-[#151517] text-[#F5F1EA] border border-white/8 rounded-[20px] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] p-6 transition-all duration-200 hover:border-white/16',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Modal
export type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
};

export function Modal({ isOpen, onClose, title, children, maxWidth = 'lg' }: ModalProps) {
  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={cn(
          'w-full bg-[#151517] text-[#F5F1EA] border border-white/10 rounded-[20px] shadow-2xl flex flex-col',
          maxWidths[maxWidth]
        )}
        style={{ maxHeight: '90vh' }}
      >
        {/* Sticky header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 shrink-0">
          <h3 className="text-base font-serif font-medium text-[#F5F1EA] truncate pr-4">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#A6A39C] hover:text-[#F5F1EA] hover:bg-white/5 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Scrollable body */}
        <div className="p-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
          {children}
        </div>
      </div>
    </div>
  );
}

// Drawer
export type DrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  width?: 'md' | 'lg' | 'xl' | '2xl';
};

export function Drawer({ isOpen, onClose, title, subtitle, children, width = 'xl' }: DrawerProps) {
  if (!isOpen) return null;

  const widths = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0 overflow-hidden">
        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
          <div className={cn('pointer-events-auto w-screen bg-[#151517] text-[#F5F1EA] border-l border-white/10 shadow-2xl flex flex-col', widths[width])}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
              <div>
                <h2 className="text-lg font-serif font-medium text-[#F5F1EA]">{title}</h2>
                {subtitle && <p className="text-xs text-[#A6A39C] mt-0.5">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-[#A6A39C] hover:text-[#F5F1EA] hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Toast Notifications Container
export function ToastContainer() {
  const { toasts, removeToast } = useAppContext();

  if (toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    danger: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-[#FF7A45] shrink-0" />,
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="flex items-start gap-3 p-4 bg-[#151517] text-[#F5F1EA] border border-white/10 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-3 duration-200"
        >
          {icons[toast.type as keyof typeof icons] || icons.info}
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-[#F5F1EA]">{toast.title}</h4>
            <p className="text-[11px] text-[#A6A39C] mt-0.5 leading-relaxed">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-[#A6A39C] hover:text-[#F5F1EA]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
