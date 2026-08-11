import React from 'react';
import { FolderOpen, X } from 'lucide-react';

export default function RestoreProjectModal({
  isOpen,
  savedAt,
  projectName,
  awardeeCount,
  onRestore,
  onDiscard,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-purple-200 rounded-xl w-[480px] shadow-2xl">
        <div className="p-4 border-b border-purple-100 flex justify-between items-center bg-purple-50/50 rounded-t-xl">
          <h3 className="text-sm font-bold text-purple-900 uppercase tracking-wider flex items-center gap-2">
            <FolderOpen size={16} className="text-purple-700" /> Restore Unsaved Project?
          </h3>
          <button onClick={onDiscard} className="text-zinc-400 hover:text-zinc-700 p-1">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-3 text-sm text-zinc-700">
          <p>
            An auto-saved project was found on this device
            {savedAt ? <> from <strong>{savedAt}</strong></> : null}.
          </p>
          <div className="rounded-lg border border-purple-100 bg-purple-50/40 p-3 text-xs space-y-1">
            <p><span className="font-semibold text-purple-900">Project:</span> {projectName || 'Untitled project'}</p>
            <p><span className="font-semibold text-purple-900">Awardees:</span> {awardeeCount ?? 0}</p>
          </div>
          <p className="text-xs text-zinc-500">
            Restore to continue where you left off, or discard to start fresh.
          </p>
        </div>

        <div className="p-4 border-t border-purple-100 bg-purple-50/50 flex justify-end gap-3 rounded-b-xl">
          <button
            onClick={onDiscard}
            className="px-4 py-2 bg-white border border-zinc-200 hover:bg-zinc-50 text-xs font-semibold text-zinc-700 rounded transition shadow-sm"
          >
            Discard
          </button>
          <button
            onClick={onRestore}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded shadow transition"
          >
            Restore Project
          </button>
        </div>
      </div>
    </div>
  );
}
