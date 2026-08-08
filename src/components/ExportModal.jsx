import React from 'react';
import { Download, FileType, Sliders, CheckSquare, Users, X } from 'lucide-react';

export default function ExportModal({
  isOpen,
  onClose,
  exportFormat,
  setExportFormat,
  exportScale,
  setExportScale,
  exportMode,
  setExportMode,
  selectedExportIndices,
  setSelectedExportIndices,
  awardees,
  executeBatchZipExport,
  isExporting
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-purple-200 rounded-xl w-[520px] max-h-[85vh] flex flex-col shadow-2xl">
        <div className="p-4 border-b border-purple-100 flex justify-between items-center bg-purple-50/50 rounded-t-xl">
          <h3 className="text-sm font-bold text-purple-900 uppercase tracking-wider flex items-center gap-2">
            <Download size={16} className="text-purple-700" /> Export Batch Certificates (.zip Archive)
          </h3>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-1"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1.5 flex items-center gap-1.5">
              <FileType size={14} className="text-purple-600" /> Export File Format:
            </label>
            <select 
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="w-full bg-purple-50/50 border border-purple-200 rounded-lg p-2.5 text-xs text-purple-950 font-bold focus:outline-none focus:border-purple-600 shadow-sm cursor-pointer"
            >
              <option value="pdf">PDF Archive (.zip with individual PDFs)</option>
              <option value="png">High-Res PNG Archive (.zip with scale images)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1.5 flex items-center gap-1.5">
              <Sliders size={14} className="text-purple-600" /> Export Quality & Scale:
            </label>
            <select 
              value={exportScale}
              onChange={(e) => setExportScale(Number(e.target.value))}
              className="w-full bg-purple-50/50 border border-purple-200 rounded-lg p-2.5 text-xs text-purple-950 font-bold focus:outline-none focus:border-purple-600 shadow-sm cursor-pointer"
            >
              <option value={1}>1x (Draft Quality - Fast & Low Memory)</option>
              <option value={2}>2x (HD Print Quality - Recommended)</option>
              <option value={3}>3x (Ultra HD Print Quality - Heavy)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-2">Select Export Scope:</label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setExportMode('all')}
                className={`p-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition ${exportMode === 'all' ? 'border-purple-600 bg-purple-50 text-purple-900' : 'border-zinc-200 bg-white text-zinc-600'}`}
              >
                <CheckSquare size={16} className="text-purple-600" /> Export All ({awardees.length})
              </button>
              <button 
                onClick={() => setExportMode('selected')}
                className={`p-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition ${exportMode === 'selected' ? 'border-purple-600 bg-purple-50 text-purple-900' : 'border-zinc-200 bg-white text-zinc-600'}`}
              >
                <Users size={16} className="text-purple-600" /> Choose Specific
              </button>
            </div>
          </div>

          {exportMode === 'selected' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[11px] text-zinc-500">
                <span>Check awardees to include in ZIP:</span>
                <button 
                  onClick={() => setSelectedExportIndices(awardees.map((_, i) => i))}
                  className="text-purple-700 hover:underline font-medium"
                >
                  Select All
                </button>
              </div>
              <div className="max-h-52 overflow-y-auto space-y-1.5 border border-purple-100 bg-purple-50/20 p-2 rounded-lg">
                {awardees.map((awardee, idx) => {
                  const isChecked = selectedExportIndices.includes(idx);
                  return (
                    <label 
                      key={awardee.id || idx}
                      className="flex items-center justify-between p-2 rounded bg-white hover:bg-purple-50/60 cursor-pointer text-xs border border-purple-100/60 shadow-sm"
                    >
                      <span className="font-medium text-zinc-800">{idx + 1}. {awardee.name || '(Unnamed Awardee)'}</span>
                      <input 
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedExportIndices(prev => [...prev, idx]);
                          } else {
                            setSelectedExportIndices(prev => prev.filter(i => i !== idx));
                          }
                        }}
                        className="w-4 h-4 accent-purple-600 cursor-pointer rounded"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-purple-100 bg-purple-50/50 flex justify-end gap-3 rounded-b-xl">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-white border border-zinc-200 hover:bg-zinc-50 text-xs font-semibold text-zinc-700 rounded transition shadow-sm"
          >
            Cancel
          </button>
          <button 
            onClick={executeBatchZipExport}
            disabled={exportMode === 'selected' && selectedExportIndices.length === 0}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded shadow transition disabled:opacity-50 flex items-center gap-2"
          >
            <Download size={14} /> Generate & Download {exportFormat.toUpperCase()} ZIP
          </button>
        </div>
      </div>
    </div>
  );
}
