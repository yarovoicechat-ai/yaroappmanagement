'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MetricCardProps {
  label?: string;
  title?: string;
  value: string | number;
  change?: number;
  changePeriod?: string;
  hint?: string;
  description?: string;
  icon?: any;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function MetricCard({
  label,
  title,
  value,
  change,
  changePeriod = 'vs last period',
  hint,
  description,
  icon: Icon,
  trend,
  color = 'text-cyan-400',
  variant,
  className
}: MetricCardProps) {
  const isPositive = trend === 'up' || (change != null && change > 0);
  const isNegative = trend === 'down' || (change != null && change < 0);
  const displayLabel = label || title || '';
  const displayHint = hint || description;

  const variantColor = 
    variant === 'danger' ? 'text-rose-400' :
    variant === 'warning' ? 'text-amber-400' :
    variant === 'success' ? 'text-emerald-400' : color;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-[#0d1222]/90 to-slate-950/80 p-4.5 backdrop-blur-xl shadow-xl shadow-black/30 hover:border-white/20 transition-all duration-200",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{displayLabel}</p>
        {Icon && (
          <div className={cn("p-2 rounded-xl border border-white/10 bg-white/[0.03] shadow-inner", variantColor)}>
            {React.isValidElement(Icon) ? Icon : <Icon className="h-4 w-4" />}
          </div>
        )}
      </div>

      <div className="mt-3">
        <p className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none">
          {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
        </p>

        {(change != null || hint) && (
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-400">
            {change != null && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md font-bold text-[11px]",
                  isPositive && "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
                  isNegative && "bg-rose-500/15 text-rose-400 border border-rose-500/30",
                  !isPositive && !isNegative && "bg-slate-800 text-slate-300"
                )}
              >
                {isPositive ? <TrendingUp className="h-3 w-3" /> : isNegative ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                <span>{Math.abs(change)}%</span>
              </span>
            )}
            <span className="truncate text-slate-500">{hint || changePeriod}</span>
          </div>
        )}
      </div>
    </div>
  );
}
