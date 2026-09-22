'use client';

import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FilterOption {
  key: string;
  label: string;
  options: { label: string; value: string }[];
}

export interface FilterBarProps {
  filters: FilterOption[];
  activeFilters: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onReset: () => void;
  className?: string;
}

export function FilterBar({
  filters,
  activeFilters,
  onChange,
  onReset,
  className
}: FilterBarProps) {
  const activeCount = Object.values(activeFilters).filter(Boolean).length;

  return (
    <div className={cn("flex flex-wrap items-center gap-2.5 p-3 rounded-2xl border border-white/10 bg-[#0d1222]/80 backdrop-blur-xl", className)}>
      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">
        <Filter className="h-3.5 w-3.5 text-cyan-400" />
        <span>Filters</span>
        {activeCount > 0 && (
          <span className="h-4 w-4 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] flex items-center justify-center border border-cyan-500/30">
            {activeCount}
          </span>
        )}
      </div>

      {filters.map(f => (
        <div key={f.key} className="relative">
          <select
            value={activeFilters[f.key] || ''}
            onChange={e => onChange(f.key, e.target.value)}
            className={cn(
              "h-8 rounded-xl border px-2.5 text-xs transition-all focus:outline-none focus:ring-1 focus:ring-cyan-500/50 appearance-none pr-7 bg-slate-950/70",
              activeFilters[f.key]
                ? "border-cyan-500/50 text-cyan-300 font-semibold bg-cyan-500/10"
                : "border-white/10 text-slate-400 hover:border-white/20"
            )}
          >
            <option value="">{f.label}: All</option>
            {f.options.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      ))}

      {activeCount > 0 && (
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors ml-auto"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset</span>
        </button>
      )}
    </div>
  );
}
