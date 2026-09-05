import React from 'react';
import { cn } from './index';

export interface TabOption {
  id: string;
  label: string;
  count?: number;
  variant?: 'amber' | 'emerald' | 'gray' | 'rose' | 'indigo';
}

interface StatusTabsProps {
  tabs: TabOption[];
  activeTab: string;
  onTabChange?: (id: string) => void;
  onChange?: (id: string) => void;
  className?: string;
}

export function StatusTabs({ tabs, activeTab, onTabChange, onChange, className }: StatusTabsProps) {
  const handleChange = (id: string) => {
    if (onTabChange) onTabChange(id);
    if (onChange) onChange(id);
  };

  const pillVariants = {
    amber: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]',
    emerald: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]',
    gray: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    rose: 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]',
    indigo: 'bg-[#EEF2FF] text-[#4F46E5] border-[#C7D2FE]',
  };

  return (
    <div className={cn('flex items-center gap-2 border-b border-[#E2E8F0] dark:border-slate-800 pb-1', className)}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        const colorStyle = tab.variant ? pillVariants[tab.variant] : pillVariants.indigo;

        return (
          <button
            key={tab.id}
            onClick={() => handleChange(tab.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 ${
              isActive
                ? 'bg-[#4F46E5] text-white border-[#4F46E5] shadow-2xs'
                : `hover:opacity-80 ${colorStyle}`
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono ${
                isActive ? 'bg-white/20 text-white' : 'bg-black/10 dark:bg-white/10'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

