import React from 'react';
import { Info, X } from 'lucide-react';

export default function CSVInstructionsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-purple-200 rounded-2xl w-[520px] max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-purple-100 flex justify-between items-center bg-purple-50/50">
          <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-2">
            <Info size={16} className="text-purple-600" /> How to use Dynamic CSV Mapping
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
              <strong className="text-purple-950">Define Custom Headers:</strong> Set your column headers in row 1 of your CSV file (e.g., <code className="bg-purple-100 text-purple-900 px-1.5 py-0.5 rounded font-mono text-[11px]">Name, Position, IssueDate, CertificateID</code>).
            </li>
            <li>
              <strong className="text-purple-950">Import Your CSV File:</strong> Click the <span className="bg-purple-100 text-purple-900 px-1.5 py-0.5 rounded font-semibold">CSV Import</span> button under the Data tab to load your entire dataset.
            </li>
            <li>
              <strong className="text-purple-950">Bind Placeholders:</strong> Click any tag under <span className="bg-purple-100 text-purple-900 px-1.5 py-0.5 rounded font-semibold">Dynamic CSV Tags</span> or manually type <code className="bg-purple-100 text-purple-900 px-1.5 py-0.5 rounded font-mono text-[11px]">{`{{HeaderName}}`}</code> into any canvas text box or QR code data field.
            </li>
            <li>
              <strong className="text-purple-950">Automatic Generation:</strong> During batch export or canvas preview, each placeholder will dynamically load every awardee's unique record.
            </li>
          </ol>

          <div className="pt-2 border-t border-purple-100">
            <span className="text-[11px] font-bold text-purple-900 block mb-1.5">Example CSV Format:</span>
            <div className="bg-zinc-900 text-purple-200 p-3 rounded-xl font-mono text-[11px] leading-relaxed shadow-inner border border-zinc-800">
              <span className="text-zinc-500">// Row 1 defines available variables</span><br />
              Name,Position,IssueDate,CertificateID<br />
              <span className="text-zinc-500">// Subsequent rows contain awardee data</span><br />
              Juan Dela Cruz,Keynote Speaker,August 2026,CERT-2026-001<br />
              Maria Clara,Participant,August 2026,CERT-2026-002
            </div>
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
