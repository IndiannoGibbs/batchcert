import React from 'react';
import { Info, X, QrCode } from 'lucide-react';

export default function QRInstructionsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-purple-200 rounded-2xl w-[520px] max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-purple-100 flex justify-between items-center bg-purple-50/50">
          <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-2">
            <Info size={16} className="text-purple-600" /> How to use the QR Code Element
          </h3>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-1 transition rounded-lg hover:bg-purple-100/50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 text-xs text-zinc-700 leading-relaxed">
          <ol className="list-decimal list-inside space-y-2.5 font-medium">
            <li>
              <strong className="text-purple-950">Add to Canvas:</strong> Click the <span className="bg-purple-100 text-purple-900 px-1.5 py-0.5 rounded font-semibold">Add QR Code Element</span> button under the Design tab.
            </li>
            <li>
              <strong className="text-purple-950">Set the Data/URL:</strong> Select the QR code on the canvas. In the top toolbar, enter your custom URL or verification link.
            </li>
            <li>
              <strong className="text-purple-950">Use Dynamic Tags:</strong> Make each QR code unique by using CSV tags (e.g., <code className="bg-purple-100 text-purple-900 px-1.5 py-0.5 rounded font-mono text-[11px]">{'https://verify.cert/{{Name}}'}</code>).
            </li>
            <li>
              <strong className="text-purple-950">Resize & Position:</strong> Drag the QR code to move it on the canvas, and use the side handle or toolbar size control to scale it.
            </li>
          </ol>

          <div className="bg-purple-50/60 border border-purple-200 p-3.5 rounded-xl text-purple-950 text-[11px] font-medium leading-relaxed shadow-inner">
            <span className="font-bold block mb-1">Automatic Generation:</span> QR codes will automatically render unique codes for every awardee during batch PDF or PNG ZIP export.
          </div>
        </div>

        <div className="p-4 border-t border-purple-100 bg-purple-50/50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow transition"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
