'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type StatusType =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'suspended'
  | 'banned'
  | 'approved'
  | 'rejected'
  | 'resolved'
  | 'escalated'
  | 'warning'
  | 'online'
  | 'offline'
  | 'live'
  | 'success'
  | 'failed'
  | 'killed'
  | 'scheduled'
  | 'completed';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  customLabel?: string;
  dot?: boolean;
  className?: string;
}

const statusStyles: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  active: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
  success: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
  online: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
  live: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30', dot: 'bg-rose-400 animate-pulse' },
  approved: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
  completed: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
  resolved: { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/30', dot: 'bg-teal-400' },
  pending: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', dot: 'bg-amber-400' },
  warning: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', dot: 'bg-amber-400' },
  scheduled: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', dot: 'bg-amber-400' },
  escalated: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30', dot: 'bg-purple-400' },
  suspended: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30', dot: 'bg-rose-400' },
  banned: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30', dot: 'bg-rose-400' },
  failed: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30', dot: 'bg-rose-400' },
  killed: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30', dot: 'bg-rose-400' },
  rejected: { bg: 'bg-slate-800', text: 'text-slate-400', border: 'border-slate-700', dot: 'bg-slate-400' },
  inactive: { bg: 'bg-slate-800', text: 'text-slate-400', border: 'border-slate-700', dot: 'bg-slate-500' },
  offline: { bg: 'bg-slate-800', text: 'text-slate-400', border: 'border-slate-700', dot: 'bg-slate-500' },
};

export function StatusBadge({ status, customLabel, dot = true, className }: StatusBadgeProps) {
  const norm = String(status || '').toLowerCase().trim();
  const config = statusStyles[norm] || statusStyles.inactive;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-bold tracking-wide uppercase shadow-sm",
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", config.dot)} />}
      <span>{customLabel || status}</span>
    </span>
  );
}
