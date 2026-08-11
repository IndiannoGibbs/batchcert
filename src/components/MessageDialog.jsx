import React from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';

const VARIANTS = {
  info: {
    icon: Info,
    iconClass: 'text-purple-700',
    headerClass: 'bg-purple-50/50 border-purple-100',
    titleClass: 'text-purple-900',
    confirmClass: 'bg-purple-600 hover:bg-purple-700 text-white',
  },
  success: {
    icon: CheckCircle2,
    iconClass: 'text-emerald-600',
    headerClass: 'bg-emerald-50/60 border-emerald-100',
    titleClass: 'text-emerald-900',
    confirmClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  },
  warning: {
    icon: AlertTriangle,
    iconClass: 'text-amber-600',
    headerClass: 'bg-amber-50/60 border-amber-100',
    titleClass: 'text-amber-900',
    confirmClass: 'bg-amber-600 hover:bg-amber-700 text-white',
  },
  error: {
    icon: XCircle,
    iconClass: 'text-red-600',
    headerClass: 'bg-red-50/60 border-red-100',
    titleClass: 'text-red-900',
    confirmClass: 'bg-red-600 hover:bg-red-700 text-white',
  },
  confirm: {
    icon: Info,
    iconClass: 'text-purple-700',
    headerClass: 'bg-purple-50/50 border-purple-100',
    titleClass: 'text-purple-900',
    confirmClass: 'bg-purple-600 hover:bg-purple-700 text-white',
  },
};

export default function MessageDialog({
  isOpen,
  title,
  message,
  variant = 'info',
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  showCancel = false,
  onConfirm,
  onCancel,
  onClose,
}) {
  if (!isOpen) return null;

  const config = VARIANTS[variant] || VARIANTS.info;
  const Icon = config.icon;
  const handleClose = onClose || onCancel || onConfirm;

  return (
    <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="bg-white border border-purple-200 rounded-xl w-full max-w-[480px] shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="message-dialog-title"
      >
        <div className={`p-4 border-b flex justify-between items-center rounded-t-xl ${config.headerClass}`}>
          <h3
            id="message-dialog-title"
            className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${config.titleClass}`}
          >
            <Icon size={16} className={config.iconClass} />
            {title}
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="text-zinc-400 hover:text-zinc-700 p-1"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 text-sm text-zinc-700 whitespace-pre-line leading-relaxed">
          {message}
        </div>

        <div className="p-4 border-t border-purple-100 bg-purple-50/50 flex justify-end gap-3 rounded-b-xl">
          {showCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-white border border-zinc-200 hover:bg-zinc-50 text-xs font-semibold text-zinc-700 rounded transition shadow-sm"
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2 text-xs font-bold rounded shadow transition ${config.confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
