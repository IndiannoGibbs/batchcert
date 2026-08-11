import React, { useEffect, useMemo, useState } from 'react';
import { Table2, X, Save, Plus, Trash2 } from 'lucide-react';
import {
  getAwardeeFieldValue,
  getBulkEditHeaders,
  createEmptyBulkEditRow,
} from '../lib/csv/parseCsv.js';

export default function AwardeeBulkEditModal({
  isOpen,
  onClose,
  awardees,
  csvHeaders,
  onSave,
}) {
  const [rows, setRows] = useState([]);
  const editHeaders = useMemo(
    () => getBulkEditHeaders(csvHeaders, awardees),
    [csvHeaders, awardees]
  );

  useEffect(() => {
    if (!isOpen) return;
    setRows(
      awardees.map((awardee) => {
        const row = { _id: awardee.id };
        editHeaders.forEach((header) => {
          row[header] = getAwardeeFieldValue(awardee, header);
        });
        return row;
      })
    );
  }, [isOpen, awardees, editHeaders]);

  if (!isOpen) return null;

  const updateCell = (rowIdx, header, value) => {
    setRows(prev => prev.map((row, i) => (i === rowIdx ? { ...row, [header]: value } : row)));
  };

  const addRow = () => {
    setRows(prev => [...prev, createEmptyBulkEditRow(editHeaders)]);
  };

  const removeRow = (rowIdx) => {
    setRows(prev => prev.filter((_, i) => i !== rowIdx));
  };

  const handleSave = () => {
    const saved = onSave(rows);
    if (saved !== false) onClose();
  };

  const filledCount = rows.filter(row =>
    editHeaders.some(header => String(row[header] ?? '').trim() !== '')
  ).length;

  return (
    <div className="fixed inset-0 z-[65] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-purple-200 rounded-xl w-[min(920px,96vw)] max-h-[85vh] flex flex-col shadow-2xl">
        <div className="p-4 border-b border-purple-100 flex justify-between items-center bg-purple-50/50 rounded-t-xl">
          <h3 className="text-sm font-bold text-purple-900 uppercase tracking-wider flex items-center gap-2">
            <Table2 size={16} className="text-purple-700" /> Bulk Edit / Add Awardees
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 p-1">
            <X size={18} />
          </button>
        </div>

        <div className="px-4 pt-3 flex items-start justify-between gap-3">
          <p className="text-xs text-zinc-600 flex-1">
            Edit existing awardees, add new rows, or remove entries. Name and Position fields auto-appear on the certificate canvas when missing.
          </p>
          <button
            onClick={addRow}
            className="shrink-0 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 text-xs font-bold rounded-lg flex items-center gap-1.5 transition"
          >
            <Plus size={14} /> Add Row
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 pt-2">
          <table className="w-full text-xs border border-purple-100 rounded-lg overflow-hidden">
            <thead className="bg-purple-50 sticky top-0 z-10">
              <tr>
                <th className="text-left p-2 font-bold text-purple-900 border-b border-purple-100 w-10">#</th>
                {editHeaders.map(header => (
                  <th key={header} className="text-left p-2 font-bold text-purple-900 border-b border-purple-100 min-w-[120px]">
                    {header}
                  </th>
                ))}
                <th className="text-left p-2 font-bold text-purple-900 border-b border-purple-100 w-10" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIdx) => (
                <tr key={row._id || rowIdx} className="border-b border-purple-50 hover:bg-purple-50/30">
                  <td className="p-2 text-zinc-500 font-semibold">{rowIdx + 1}</td>
                  {editHeaders.map(header => (
                    <td key={header} className="p-1">
                      <input
                        type="text"
                        value={row[header] ?? ''}
                        onChange={(e) => updateCell(rowIdx, header, e.target.value)}
                        className="w-full border border-purple-100 rounded px-2 py-1.5 text-zinc-900 focus:outline-none focus:border-purple-500 bg-white"
                      />
                    </td>
                  ))}
                  <td className="p-1">
                    <button
                      onClick={() => removeRow(rowIdx)}
                      disabled={rows.length <= 1}
                      className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded transition disabled:opacity-30"
                      title="Remove row"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 pb-2 text-[11px] text-zinc-500">
          {filledCount} awardee{filledCount === 1 ? '' : 's'} will be saved. Empty rows are skipped.
        </div>

        <div className="p-4 border-t border-purple-100 bg-purple-50/40 flex justify-end gap-3 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-zinc-200 hover:bg-zinc-50 text-xs font-semibold text-zinc-700 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={filledCount === 0}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition"
          >
            <Save size={14} /> Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
}
