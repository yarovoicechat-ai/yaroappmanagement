'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export function SkeletonLoader({
  type = 'card',
  count = 1,
  className
}: {
  type?: 'card' | 'table' | 'profile' | 'metric';
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4 animate-pulse", className)}>
      {Array.from({ length: count }).map((_, i) => {
        if (type === 'metric') {
          return (
            <div key={i} className="h-28 rounded-2xl border border-white/10 bg-slate-900/40 p-4 space-y-3">
              <div className="h-3 w-1/3 rounded bg-white/10" />
              <div className="h-7 w-1/2 rounded bg-white/10" />
              <div className="h-2 w-2/3 rounded bg-white/10" />
            </div>
          );
        }
        if (type === 'table') {
          return (
            <div key={i} className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 space-y-3">
              <div className="h-10 rounded-xl bg-white/10 w-full" />
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className="h-8 rounded-lg bg-white/5 w-full" />
                ))}
              </div>
            </div>
          );
        }
        return (
          <div key={i} className="h-36 rounded-2xl border border-white/10 bg-slate-900/40 p-5 space-y-3">
            <div className="h-4 w-1/3 rounded bg-white/10" />
            <div className="h-6 w-2/3 rounded bg-white/10" />
            <div className="h-3 w-full rounded bg-white/10" />
          </div>
        );
      })}
    </div>
  );
}
