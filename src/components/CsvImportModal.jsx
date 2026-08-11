import React, { useEffect, useMemo, useState } from 'react';
import { Upload, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { validateCsvImport } from '../lib/csv/validateCsv.js';

export default function CsvImportModal({
  isOpen,
  onClose,
  parsedCsv,
  onConfirm,
}) {
  const [nameColumn, setNameColumn] = useState('');
  const [positionColumn, setPositionColumn] = useState('');

  useEffect(() => {
    setNameColumn(parsedCsv?.defaultMapping?.nameColumn || '');
    setPositionColumn(parsedCsv?.defaultMapping?.positionColumn || '');
  }, [parsedCsv]);

  const headers = parsedCsv?.headers || [];
  const rows = parsedCsv?.rows || [];

  const validation = useMemo(() => validateCsvImport({
    headers,
    rows,
    nameColumn,
    positionColumn,
  }), [headers, rows, nameColumn, positionColumn]);

  if (!isOpen || !parsedCsv) return null;

  const handleConfirm = () => {
    if (!validation.canImport) return;
    onConfirm({ nameColumn, positionColumn, headers, rows });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-purple-200 rounded-xl w-[560px] max-h-[85vh] flex flex-col shadow-2xl">
        <div className="p-4 border-b border-purple-100 flex justify-between items-center bg-purple-50/50 rounded-t-xl">
          <h3 className="text-sm font-bold text-purple-900 uppercase tracking-wider flex items-center gap-2">
            <Upload size={16} className="text-purple-700" /> Import CSV — Map Columns
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 p-1">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1.5">Name Column</label>
              <select
                value={nameColumn}
                onChange={(e) => setNameColumn(e.target.value)}
                className="w-full bg-purple-50/50 border border-purple-200 rounded-lg p-2.5 text-xs text-purple-950 font-bold focus:outline-none focus:border-purple-600"
              >
                <option value="">— Select column —</option>
                {headers.map(header => (
                  <option key={header} value={header}>{header}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1.5">Position Column</label>
              <select
                value={positionColumn}
                onChange={(e) => setPositionColumn(e.target.value)}
                className="w-full bg-purple-50/50 border border-purple-200 rounded-lg p-2.5 text-xs text-purple-950 font-bold focus:outline-none focus:border-purple-600"
              >
                <option value="">— Optional —</option>
                {headers.map(header => (
                  <option key={header} value={header}>{header}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-lg border border-purple-100 bg-purple-50/30 p-3 text-xs space-y-1">
            <p className="font-semibold text-purple-900">Import preview</p>
            <p>{validation.stats.validRows} of {validation.stats.totalRows} rows will be imported</p>
            <p>{headers.length} columns detected: {headers.join(', ')}</p>
          </div>

          {validation.issues.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 space-y-1">
              {validation.issues.map(issue => (
                <p key={issue} className="text-xs text-red-700 flex items-start gap-1.5">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" /> {issue}
                </p>
              ))}
            </div>
          )}

          {validation.warnings.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-1">
              {validation.warnings.map(warning => (
                <p key={warning} className="text-xs text-amber-800 flex items-start gap-1.5">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" /> {warning}
                </p>
              ))}
            </div>
          )}

          {validation.canImport && (
            <p className="text-xs text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 size={14} /> Ready to import {validation.stats.validRows} awardee(s).
            </p>
          )}

          <div className="max-h-40 overflow-y-auto border border-purple-100 rounded-lg">
            <table className="w-full text-[11px]">
              <thead className="bg-purple-50/60 sticky top-0">
                <tr>
                  {headers.map(header => (
                    <th key={header} className="text-left px-2 py-1.5 font-bold text-purple-900 border-b border-purple-100">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 8).map(row => (
                  <tr key={row.id} className="border-b border-purple-50">
                    {headers.map(header => (
                      <td key={header} className="px-2 py-1.5 text-zinc-700">{row.rowData[header] || '—'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 8 && (
              <p className="text-[10px] text-zinc-500 px-2 py-1">Showing first 8 of {rows.length} rows…</p>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-purple-100 bg-purple-50/50 flex justify-end gap-3 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-zinc-200 hover:bg-zinc-50 text-xs font-semibold text-zinc-700 rounded transition shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!validation.canImport}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded shadow transition disabled:opacity-50"
          >
            Import {validation.stats.validRows} Awardee(s)
          </button>
        </div>
      </div>
    </div>
  );
}
