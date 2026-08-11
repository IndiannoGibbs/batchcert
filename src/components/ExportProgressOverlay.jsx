import React from 'react';
import { Download, X } from 'lucide-react';

export default function ExportProgressOverlay({
  visible,
  progress,
  label,
  onCancel,
}) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-purple-200 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
              <Download size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-purple-900">Exporting certificates</p>
              <p className="text-xs text-zinc-500 mt-0.5">{label || 'Please keep this tab open.'}</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition"
            title="Cancel export"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2">
          <div className="h-2.5 rounded-full bg-purple-100 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-violet-500 transition-all duration-300"
              style={{ width: `${Math.max(0, Math.min(100, progress || 0))}%` }}
            />
          </div>
          <p className="text-xs font-semibold text-purple-900 text-center">{progress || 0}% complete</p>
        </div>

        <button
          onClick={onCancel}
          className="w-full py-2.5 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition"
        >
          Cancel export
        </button>
      </div>
    </div>
  );
}
