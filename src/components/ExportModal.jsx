import React, { useMemo, useState, useEffect } from 'react';
import { Download, FileType, Sliders, CheckSquare, Users, X, FileText, Eye, AlertTriangle, Search } from 'lucide-react';
import { estimateExport, getExportEstimateLabel } from '../lib/export/estimateExport.js';

const awardeeMatchesExportSearch = (awardee, query) => {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (awardee.name || '').toLowerCase().includes(q)
    || (awardee.position || '').toLowerCase().includes(q);
};

export default function ExportModal({
  isOpen,
  onClose,
  exportFormat,
  setExportFormat,
  exportScale,
  setExportScale,
  exportMode,
  setExportMode,
  exportDelivery,
  setExportDelivery,
  selectedExportIndices,
  setSelectedExportIndices,
  awardees,
  executeBatchZipExport,
  exportAllToSinglePDF,
  exportPreviewPdf,
  exportSummary,
  exportEstimate,
  canvasSize,
  isExporting,
}) {
  const [exportSearchQuery, setExportSearchQuery] = useState('');

  useEffect(() => {
    if (!isOpen) setExportSearchQuery('');
  }, [isOpen]);

  const filteredAwardees = useMemo(() => (
    awardees
      .map((awardee, idx) => ({ awardee, idx }))
      .filter(({ awardee }) => awardeeMatchesExportSearch(awardee, exportSearchQuery))
  ), [awardees, exportSearchQuery]);

  const exportCount = exportMode === 'all' ? awardees.length : selectedExportIndices.length;
  const isSinglePdf = exportDelivery === 'single-pdf';
  const estimateFormat = isSinglePdf ? 'pdf' : exportFormat;

  const localEstimate = useMemo(() => exportEstimate || estimateExport({
    count: exportCount,
    canvasSize: canvasSize || { width: 1100, height: 850 },
    exportScale,
    exportFormat: estimateFormat,
  }), [exportEstimate, exportCount, exportScale, estimateFormat, canvasSize]);

  if (!isOpen) return null;

  const filteredIndices = filteredAwardees.map(({ idx }) => idx);
  const hasSearch = exportSearchQuery.trim().length > 0;
  const canExportSelected = exportMode !== 'selected' || selectedExportIndices.length > 0;
  const estimateLabel = getExportEstimateLabel(localEstimate);

  const handlePrimaryExport = () => {
    if (isSinglePdf) {
      exportAllToSinglePDF?.({ exportMode, selectedExportIndices, onCloseModal: onClose });
      return;
    }
    executeBatchZipExport?.();
  };

  const primaryExportLabel = isSinglePdf
    ? `Export ${exportCount} as Single PDF`
    : `Download ${exportFormat.toUpperCase()} ZIP (${exportCount})`;

  const handleSelectAll = () => {
    if (hasSearch) {
      setSelectedExportIndices(prev => Array.from(new Set([...prev, ...filteredIndices])).sort((a, b) => a - b));
      return;
    }
    setSelectedExportIndices(awardees.map((_, i) => i));
  };

  const handleUnselectAll = () => {
    if (hasSearch) {
      const filteredSet = new Set(filteredIndices);
      setSelectedExportIndices(prev => prev.filter(i => !filteredSet.has(i)));
      return;
    }
    setSelectedExportIndices([]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-purple-200 rounded-xl w-[520px] max-h-[85vh] flex flex-col shadow-2xl">
        <div className="p-4 border-b border-purple-100 flex justify-between items-center bg-purple-50/50 rounded-t-xl">
          <h3 className="text-sm font-bold text-purple-900 uppercase tracking-wider flex items-center gap-2">
            <Download size={16} className="text-purple-700" /> Export Certificates
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-1"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {exportSummary && (
            <div className="rounded-lg border border-purple-100 bg-purple-50/40 px-3 py-2 text-[11px] text-purple-900 font-medium">
              {exportSummary}
            </div>
          )}

          {exportCount > 0 && estimateLabel && (
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-[11px] text-zinc-700 font-medium">
              {estimateLabel}
            </div>
          )}

          {(localEstimate.memoryWarning || localEstimate.heavyBatch) && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-900 flex items-start gap-2">
              <AlertTriangle size={14} className="shrink-0 mt-0.5 text-amber-600" />
              <span>
                {localEstimate.memoryWarning
                  ? '3x Ultra HD with large batches can use significant browser memory. Consider 2x HD for 50+ awardees.'
                  : 'Large batch export in progress — keep this browser tab active until complete.'}
              </span>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-2">Export Type:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setExportDelivery('zip')}
                className={`p-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition ${exportDelivery === 'zip' ? 'border-purple-600 bg-purple-50 text-purple-900' : 'border-zinc-200 bg-white text-zinc-600'}`}
              >
                <Download size={16} className="text-purple-600" /> ZIP Archive
              </button>
              <button
                type="button"
                onClick={() => setExportDelivery('single-pdf')}
                className={`p-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition ${exportDelivery === 'single-pdf' ? 'border-purple-600 bg-purple-50 text-purple-900' : 'border-zinc-200 bg-white text-zinc-600'}`}
              >
                <FileText size={16} className="text-purple-600" /> Single PDF
              </button>
            </div>
            <p className="text-[10px] text-zinc-500 mt-1.5">
              {isSinglePdf
                ? 'One multi-page PDF with each awardee on its own page.'
                : 'A ZIP file containing one file per awardee.'}
            </p>
          </div>

          {!isSinglePdf && (
            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1.5 flex items-center gap-1.5">
                <FileType size={14} className="text-purple-600" /> ZIP File Format:
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
          )}

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
            <label className="text-xs font-semibold text-zinc-700 block mb-2">
              Awardees to Include ({isSinglePdf ? 'Single PDF' : 'ZIP'}):
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setExportMode('all')}
                className={`p-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition ${exportMode === 'all' ? 'border-purple-600 bg-purple-50 text-purple-900' : 'border-zinc-200 bg-white text-zinc-600'}`}
              >
                <CheckSquare size={16} className="text-purple-600" /> Export All ({awardees.length})
              </button>
              <button
                type="button"
                onClick={() => setExportMode('selected')}
                className={`p-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition ${exportMode === 'selected' ? 'border-purple-600 bg-purple-50 text-purple-900' : 'border-zinc-200 bg-white text-zinc-600'}`}
              >
                <Users size={16} className="text-purple-600" /> Choose Specific
              </button>
            </div>
          </div>

          {exportMode === 'selected' && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 bg-purple-50/60 border border-purple-200 rounded-lg px-2.5 py-1.5 shadow-sm">
                <Search size={14} className="text-purple-600 shrink-0" />
                <input
                  type="text"
                  value={exportSearchQuery}
                  onChange={(e) => setExportSearchQuery(e.target.value)}
                  placeholder="Search by name or position…"
                  className="bg-transparent text-xs text-zinc-900 focus:outline-none w-full font-medium"
                />
                {exportSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setExportSearchQuery('')}
                    className="text-zinc-400 hover:text-zinc-600 shrink-0"
                    title="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="flex justify-between items-center text-[11px] text-zinc-500">
                <span>
                  {hasSearch
                    ? `${filteredAwardees.length} match${filteredAwardees.length === 1 ? '' : 'es'} · check to include`
                    : 'Check awardees to include:'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-purple-700 hover:underline font-medium"
                  >
                    {hasSearch ? 'Select Matching' : 'Select All'}
                  </button>
                  <span className="text-zinc-300">|</span>
                  <button
                    type="button"
                    onClick={handleUnselectAll}
                    className="text-purple-700 hover:underline font-medium"
                  >
                    {hasSearch ? 'Unselect Matching' : 'Unselect All'}
                  </button>
                </div>
              </div>
              <div className="max-h-52 overflow-y-auto space-y-1.5 border border-purple-100 bg-purple-50/20 p-2 rounded-lg">
                {filteredAwardees.length === 0 ? (
                  <p className="text-xs text-zinc-500 px-2 py-3 text-center">No awardees match your search.</p>
                ) : filteredAwardees.map(({ awardee, idx }) => {
                  const isChecked = selectedExportIndices.includes(idx);
                  return (
                    <label
                      key={awardee.id || idx}
                      className={`flex items-center gap-2 p-2 rounded bg-white hover:bg-purple-50/60 cursor-pointer text-xs border shadow-sm transition ${isChecked ? 'border-purple-400 bg-purple-50/40' : 'border-purple-100/60'}`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedExportIndices(prev => [...prev, idx].sort((a, b) => a - b));
                          } else {
                            setSelectedExportIndices(prev => prev.filter(i => i !== idx));
                          }
                        }}
                        className="w-4 h-4 accent-purple-600 cursor-pointer rounded shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-zinc-900 block truncate">
                          #{idx + 1}. {awardee.name || '(Unnamed Awardee)'}
                        </span>
                        <span className="text-[10px] text-zinc-500 block truncate uppercase tracking-wide">
                          {awardee.position || 'No position'}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
              <p className="text-[10px] text-zinc-500">
                {selectedExportIndices.length} of {awardees.length} selected
              </p>
            </div>
          )}

          <div className="rounded-lg border border-purple-100 bg-purple-50/30 p-3">
            <p className="text-[11px] font-bold text-purple-900 uppercase tracking-wider mb-2">Export preview</p>
            <p className="text-xs text-zinc-600 mb-3">
              Export one test PDF for the currently selected awardee before running the full batch.
            </p>
            <button
              type="button"
              onClick={exportPreviewPdf}
              disabled={isExporting || awardees.length === 0}
              className="w-full py-2 bg-white border border-purple-300 hover:bg-purple-50 text-purple-900 text-xs font-bold rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 transition"
            >
              <Eye size={14} /> Export Preview PDF (Current Awardee)
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-purple-100 bg-purple-50/50 flex flex-col gap-2 rounded-b-xl">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-zinc-200 hover:bg-zinc-50 text-xs font-semibold text-zinc-700 rounded transition shadow-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePrimaryExport}
              disabled={!canExportSelected || isExporting || exportCount === 0}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded shadow transition disabled:opacity-50 flex items-center gap-2"
            >
              {isSinglePdf ? <FileText size={14} /> : <Download size={14} />}
              {primaryExportLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
