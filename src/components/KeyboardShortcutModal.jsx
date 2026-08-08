import React from 'react';
import { HelpCircle, X } from 'lucide-react';

export default function KeyboardShortcutModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-purple-200 rounded-2xl w-[520px] max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-purple-100 flex justify-between items-center bg-purple-50/50">
          <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-2">
            <HelpCircle size={16} className="text-purple-600" /> Keyboard Shortcut Cheat Sheet
          </h3>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-1 transition rounded-lg hover:bg-purple-100/50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-3 text-xs text-zinc-700">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-purple-50/50 p-2.5 rounded-xl border border-purple-100 flex justify-between items-center">
              <span className="font-semibold text-zinc-800">Undo</span>
              <kbd className="bg-white px-2 py-1 rounded border border-purple-200 font-mono text-[11px] text-purple-900 font-bold shadow-sm">Ctrl + Z</kbd>
            </div>
            <div className="bg-purple-50/50 p-2.5 rounded-xl border border-purple-100 flex justify-between items-center">
              <span className="font-semibold text-zinc-800">Redo</span>
              <kbd className="bg-white px-2 py-1 rounded border border-purple-200 font-mono text-[11px] text-purple-900 font-bold shadow-sm">Ctrl + Y / Shift+Z</kbd>
            </div>
            <div className="bg-purple-50/50 p-2.5 rounded-xl border border-purple-100 flex justify-between items-center">
              <span className="font-semibold text-zinc-800">Save Project</span>
              <kbd className="bg-white px-2 py-1 rounded border border-purple-200 font-mono text-[11px] text-purple-900 font-bold shadow-sm">Ctrl + S</kbd>
            </div>
            <div className="bg-purple-50/50 p-2.5 rounded-xl border border-purple-100 flex justify-between items-center">
              <span className="font-semibold text-zinc-800">Select All Elements</span>
              <kbd className="bg-white px-2 py-1 rounded border border-purple-200 font-mono text-[11px] text-purple-900 font-bold shadow-sm">Ctrl + A</kbd>
            </div>
            <div className="bg-purple-50/50 p-2.5 rounded-xl border border-purple-100 flex justify-between items-center">
              <span className="font-semibold text-zinc-800">Toggle Bold</span>
              <kbd className="bg-white px-2 py-1 rounded border border-purple-200 font-mono text-[11px] text-purple-900 font-bold shadow-sm">Ctrl + B</kbd>
            </div>
            <div className="bg-purple-50/50 p-2.5 rounded-xl border border-purple-100 flex justify-between items-center">
              <span className="font-semibold text-zinc-800">Toggle Italic</span>
              <kbd className="bg-white px-2 py-1 rounded border border-purple-200 font-mono text-[11px] text-purple-900 font-bold shadow-sm">Ctrl + I</kbd>
            </div>
            <div className="bg-purple-50/50 p-2.5 rounded-xl border border-purple-100 flex justify-between items-center">
              <span className="font-semibold text-zinc-800">Toggle Underline</span>
              <kbd className="bg-white px-2 py-1 rounded border border-purple-200 font-mono text-[11px] text-purple-900 font-bold shadow-sm">Ctrl + U</kbd>
            </div>
            <div className="bg-purple-50/50 p-2.5 rounded-xl border border-purple-100 flex justify-between items-center">
              <span className="font-semibold text-zinc-800">Delete Selected</span>
              <kbd className="bg-white px-2 py-1 rounded border border-purple-200 font-mono text-[11px] text-purple-900 font-bold shadow-sm">Delete / Backspace</kbd>
            </div>
          </div>

          <div className="pt-2 border-t border-purple-100 space-y-1.5">
            <span className="font-bold text-purple-950 block">Canvas Navigation & Nudging:</span>
            <div className="bg-purple-50/30 p-3 rounded-xl border border-purple-100 flex flex-col gap-1 text-[11px]">
              <p>• <strong className="text-zinc-800">Arrow Keys:</strong> Nudge selected element(s) by 0.5%</p>
              <p>• <strong className="text-zinc-800">Shift + Arrow Keys:</strong> Fast nudge selected element(s) by 2.0%</p>
              <p>• <strong className="text-zinc-800">Shift + Click:</strong> Multi-select individual canvas elements</p>
              <p>• <strong className="text-zinc-800">Click & Drag on Canvas:</strong> Multi-select box (marquee selection)</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-purple-100 bg-purple-50/50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
