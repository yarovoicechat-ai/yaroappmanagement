'use client';

import React, { useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { AlertTriangle, Loader2, X, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ConfirmDialogProps {
  isOpen?: boolean;
  open?: boolean;
  title: string;
  description: string;
  impactWarning?: string;
  requireReason?: boolean;
  reasonPlaceholder?: string;
  confirmLabel?: string;
  confirmText?: string;
  cancelLabel?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
  onConfirm: (reason: string) => void | Promise<void>;
  onClose?: () => void;
  onCancel?: () => void;
}

export function ConfirmDialog({
  isOpen,
  open,
  title,
  description,
  impactWarning,
  requireReason = false,
  reasonPlaceholder = 'Please enter reason for this audit log...',
  confirmLabel,
  confirmText,
  cancelLabel,
  cancelText,
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onClose,
  onCancel
}: ConfirmDialogProps) {
  const isCurrentlyOpen = open !== undefined ? open : (isOpen || false);
  const effectiveConfirmLabel = confirmText || confirmLabel || 'Confirm Action';
  const effectiveCancelLabel = cancelText || cancelLabel || 'Cancel';
  const handleClose = () => {
    if (onCancel) onCancel();
    else if (onClose) onClose();
  };

  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    if (requireReason && !reason.trim()) {
      setError('A reason is mandatory for audit logging');
      return;
    }
    setError('');
    await onConfirm(reason);
  };

  const variantStyles = {
    danger: {
      icon: AlertTriangle,
      iconColor: 'text-rose-400 bg-rose-500/15 border-rose-500/30',
      btn: 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/50'
    },
    warning: {
      icon: ShieldAlert,
      iconColor: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
      btn: 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-950/50'
    },
    primary: {
      icon: ShieldAlert,
      iconColor: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30',
      btn: 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-950/50'
    }
  }[variant];

  const Icon = variantStyles.icon;

  return (
    <DialogPrimitive.Root open={isCurrentlyOpen} onOpenChange={o => !o && handleClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md transition-all duration-200 animate-in fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%]",
            "rounded-3xl border border-white/10 bg-[#0d1222]/95 p-6 sm:p-7 shadow-2xl shadow-black/90",
            "backdrop-blur-2xl duration-200 animate-in fade-in-0 zoom-in-95"
          )}
        >
          <div className="flex items-start gap-4">
            <div className={cn("p-3 rounded-2xl border shrink-0", variantStyles.iconColor)}>
              <Icon size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <DialogPrimitive.Title className="text-lg font-bold text-white tracking-tight">
                {title}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-1 text-xs sm:text-sm text-slate-400 leading-relaxed">
                {description}
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close onClick={handleClose} className="text-slate-500 hover:text-white p-1 rounded-lg">
              <X size={18} />
            </DialogPrimitive.Close>
          </div>

          {impactWarning && (
            <div className="mt-4 p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs text-amber-300 leading-normal">
              <strong>Impact Notice:</strong> {impactWarning}
            </div>
          )}

          {requireReason && (
            <div className="mt-4 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Reason for Action <span className="text-rose-400">*</span>
              </label>
              <textarea
                value={reason}
                onChange={e => {
                  setReason(e.target.value);
                  if (error) setError('');
                }}
                placeholder={reasonPlaceholder}
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-slate-950/70 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
              />
              {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-white/10">
            <button
              type="button"
              disabled={isLoading}
              onClick={handleClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
            >
              {effectiveCancelLabel}
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={handleConfirm}
              className={cn(
                "inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50",
                variantStyles.btn
              )}
            >
              {isLoading && <Loader2 size={14} className="animate-spin" />}
              {effectiveConfirmLabel}
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
