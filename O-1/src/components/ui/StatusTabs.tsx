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

  return (
    <div className={cn('flex items-center gap-2 border-b border-white/8 pb-3 overflow-x-auto scrollbar-none', className)}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => handleChange(tab.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 border flex items-center gap-2 cursor-pointer ${
              isActive
                ? 'bg-white text-black border-white shadow-sm font-bold'
                : 'bg-white/5 text-[#A6A39C] border-white/10 hover:bg-white/10 hover:text-[#F5F1EA]'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`px-2 py-0.5 text-[10px] rounded-full font-mono font-medium ${
                isActive ? 'bg-black/10 text-black' : 'bg-white/10 text-[#A6A39C]'
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

