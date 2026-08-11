import React, { useState } from 'react';
import {
  Sparkles, Layout, Upload, Download, ArrowRight, ArrowLeft, CheckCircle2,
  FileSpreadsheet, X, BookOpen, SkipForward,
} from 'lucide-react';
import { CANVAS_PRESETS, PRESET_BACKGROUNDS } from '../constants/index.js';
import { parseCsvText, guessDefaultMapping } from '../lib/csv/parseCsv.js';
import { validateCsvImport } from '../lib/csv/validateCsv.js';

const STEPS = ['welcome', 'template', 'csv', 'finish'];

export default function OnboardingWizard({
  isOpen,
  onClose,
  onComplete,
  onLoadSample,
  onApplyTemplate,
  onImportCsv,
  onExportTest,
  isExporting,
}) {
  const [step, setStep] = useState('welcome');
  const [path, setPath] = useState(null);
  const [selectedPresetId, setSelectedPresetId] = useState('letter-landscape');
  const [selectedBg, setSelectedBg] = useState('classic');
  const [csvDraft, setCsvDraft] = useState(null);
  const [nameColumn, setNameColumn] = useState('');
  const [positionColumn, setPositionColumn] = useState('');
  const [exportDone, setExportDone] = useState(false);

  if (!isOpen) return null;

  const stepIndex = STEPS.indexOf(step);
  const preset = CANVAS_PRESETS.find(p => p.id === selectedPresetId) || CANVAS_PRESETS[0];

  const csvValidation = csvDraft ? validateCsvImport({
    headers: csvDraft.headers,
    rows: csvDraft.rows,
    nameColumn,
    positionColumn,
  }) : null;

  const goNext = () => {
    if (step === 'welcome') {
      if (path === 'sample') {
        onLoadSample?.();
        setStep('finish');
        return;
      }
      setStep('template');
    } else if (step === 'template') {
      onApplyTemplate?.({
        canvasSize: { width: preset.width, height: preset.height, label: preset.name },
        bgType: selectedBg,
      });
      setStep(path === 'csv' ? 'csv' : 'finish');
    } else if (step === 'csv') {
      if (csvDraft && csvValidation?.canImport) {
        onImportCsv?.({ headers: csvDraft.headers, rows: csvDraft.rows, nameColumn, positionColumn });
      }
      setStep('finish');
    } else {
      onComplete?.();
    }
  };

  const goBack = () => {
    if (step === 'template') setStep('welcome');
    else if (step === 'csv') setStep('template');
    else if (step === 'finish' && path !== 'sample') setStep(path === 'csv' ? 'csv' : 'template');
  };

  const handleCsvFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const reader = new FileReader();
    reader.onload = (evt) => {
      const parsed = parseCsvText(evt.target.result);
      if (parsed.error) {
        alert(parsed.error);
        return;
      }
      const defaultMapping = guessDefaultMapping(parsed.headers, parsed.normalizedHeaders);
      setCsvDraft(parsed);
      setNameColumn(defaultMapping.nameColumn);
      setPositionColumn(defaultMapping.positionColumn);
    };
    reader.readAsText(file);
  };

  const handleExportTest = async () => {
    await onExportTest?.();
    setExportDone(true);
  };

  const handleSkip = () => {
    onComplete?.();
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-purple-200 rounded-2xl w-[640px] max-h-[90vh] flex flex-col shadow-2xl">
        <div className="p-4 border-b border-purple-100 flex justify-between items-center bg-gradient-to-r from-purple-50 to-white rounded-t-2xl">
          <div>
            <h2 className="text-sm font-bold text-purple-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={16} className="text-purple-600" /> Welcome to BatchCert
            </h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Step {stepIndex + 1} of {STEPS.length} · Quick setup wizard
            </p>
          </div>
          <button onClick={handleSkip} className="text-zinc-400 hover:text-zinc-700 p-1" title="Skip setup">
            <X size={18} />
          </button>
        </div>

        <div className="px-4 pt-3">
          <div className="flex gap-1">
            {STEPS.map((s, i) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition ${i <= stepIndex ? 'bg-purple-600' : 'bg-purple-100'}`}
              />
            ))}
          </div>
        </div>

        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {step === 'welcome' && (
            <>
              <p className="text-sm text-zinc-700 leading-relaxed">
                Choose how you want to get started. You can always import CSV data and change templates later in the editor.
              </p>
              <div className="grid gap-3">
                <button
                  onClick={() => {
                    setPath('sample');
                    onLoadSample?.();
                    setStep('finish');
                  }}
                  className="p-4 rounded-xl border-2 border-purple-200 bg-purple-50/50 hover:border-purple-500 hover:bg-purple-50 text-left transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-600 text-white"><BookOpen size={18} /></div>
                    <div>
                      <p className="font-bold text-purple-900 text-sm">Try the sample project (Recommended)</p>
                      <p className="text-xs text-zinc-600 mt-0.5">Pre-loaded certificate with 3 awardees — explore immediately</p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => { setPath('guided'); setStep('template'); }}
                  className="p-4 rounded-xl border border-zinc-200 hover:border-purple-300 hover:bg-purple-50/30 text-left transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-zinc-100 text-zinc-700 group-hover:bg-purple-100"><Layout size={18} /></div>
                    <div>
                      <p className="font-bold text-zinc-900 text-sm">Guided setup from scratch</p>
                      <p className="text-xs text-zinc-600 mt-0.5">Pick canvas size, background, and optionally import CSV</p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => { setPath('csv'); setStep('template'); }}
                  className="p-4 rounded-xl border border-zinc-200 hover:border-purple-300 hover:bg-purple-50/30 text-left transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-zinc-100 text-zinc-700"><Upload size={18} /></div>
                    <div>
                      <p className="font-bold text-zinc-900 text-sm">I have a CSV ready</p>
                      <p className="text-xs text-zinc-600 mt-0.5">Choose template, then map your spreadsheet columns</p>
                    </div>
                  </div>
                </button>
              </div>
            </>
          )}

          {step === 'template' && (
            <>
              <p className="text-sm text-zinc-700">Select a canvas size and background style for your certificates.</p>
              <div>
                <label className="text-xs font-bold text-purple-900 uppercase tracking-wider mb-2 block">Canvas Size</label>
                <div className="grid grid-cols-2 gap-2">
                  {CANVAS_PRESETS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPresetId(p.id)}
                      className={`p-3 rounded-lg border text-left text-xs transition ${selectedPresetId === p.id ? 'border-purple-600 bg-purple-50 ring-1 ring-purple-600' : 'border-zinc-200 hover:bg-zinc-50'}`}
                    >
                      <span className="font-bold text-zinc-900 block">{p.name}</span>
                      <span className="text-zinc-500">{p.width}×{p.height}px</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-purple-900 uppercase tracking-wider mb-2 block">Background Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(PRESET_BACKGROUNDS).map(([key, bg]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedBg(key)}
                      className={`p-3 rounded-lg border text-xs font-semibold transition ${selectedBg === key ? 'border-purple-600 bg-purple-50 ring-1 ring-purple-600 text-purple-900' : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'}`}
                    >
                      {bg.name}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 'csv' && (
            <>
              <p className="text-sm text-zinc-700">
                Upload your awardee list. Need a template?{' '}
                <a href="/sample-awardees.csv" download className="text-purple-700 font-semibold hover:underline">
                  Download sample CSV
                </a>
              </p>
              <label className="flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed border-purple-200 rounded-xl bg-purple-50/30 cursor-pointer hover:bg-purple-50/60 transition">
                <FileSpreadsheet size={28} className="text-purple-600" />
                <span className="text-sm font-semibold text-purple-900">Click to upload CSV file</span>
                <span className="text-xs text-zinc-500">Headers required: Name, Position (plus any custom columns)</span>
                <input type="file" accept=".csv" onChange={handleCsvFile} className="hidden" />
              </label>

              {csvDraft && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-zinc-700 block mb-1">Name column</label>
                      <select
                        value={nameColumn}
                        onChange={(e) => setNameColumn(e.target.value)}
                        className="w-full border border-purple-200 rounded-lg p-2 text-xs font-semibold"
                      >
                        <option value="">— Select —</option>
                        {csvDraft.headers.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-700 block mb-1">Position column</label>
                      <select
                        value={positionColumn}
                        onChange={(e) => setPositionColumn(e.target.value)}
                        className="w-full border border-purple-200 rounded-lg p-2 text-xs font-semibold"
                      >
                        <option value="">— Optional —</option>
                        {csvDraft.headers.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                  </div>
                  {csvValidation && (
                    <p className={`text-xs ${csvValidation.canImport ? 'text-emerald-700' : 'text-red-600'}`}>
                      {csvValidation.canImport
                        ? `Ready to import ${csvValidation.stats.validRows} awardee(s).`
                        : csvValidation.issues[0] || 'Fix mapping to continue.'}
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {step === 'finish' && (
            <>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 flex items-start gap-3">
                <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-emerald-900 text-sm">You're ready to design!</p>
                  <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                    {path === 'sample'
                      ? 'Explore the sample certificate, switch awardees with the toolbar, then export when ready.'
                      : 'Add text fields in the Design tab, drag elements on the canvas, and use {{ColumnName}} tags for dynamic CSV data.'}
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-purple-100 bg-purple-50/40 p-4 space-y-3">
                <p className="text-xs font-bold text-purple-900 uppercase tracking-wider">Optional: export a test PDF</p>
                <p className="text-xs text-zinc-600">
                  Verify print quality before batch-exporting your full list. This exports the currently selected awardee only.
                </p>
                <button
                  onClick={handleExportTest}
                  disabled={isExporting}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 transition"
                >
                  <Download size={14} />
                  {isExporting ? 'Exporting…' : exportDone ? 'Test PDF exported ✓' : 'Export test PDF'}
                </button>
              </div>
              <ul className="text-xs text-zinc-600 space-y-1.5 list-disc pl-4">
                <li>Use the <strong>Data</strong> tab to edit global fields and awardee lists</li>
                <li>Click <strong>Export Certificates</strong> in the sidebar for ZIP or single PDF batch export</li>
                <li>Reopen this wizard anytime from the top bar → Setup Wizard</li>
              </ul>
            </>
          )}
        </div>

        <div className="p-4 border-t border-purple-100 bg-purple-50/40 flex justify-between items-center rounded-b-2xl">
          <div className="flex gap-2">
            {step !== 'welcome' && step !== 'finish' && (
              <button onClick={goBack} className="px-3 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 flex items-center gap-1">
                <ArrowLeft size={14} /> Back
              </button>
            )}
            <button onClick={handleSkip} className="px-3 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-800 flex items-center gap-1">
              <SkipForward size={14} /> Skip setup
            </button>
          </div>
          {step !== 'welcome' && (
            <button
              onClick={goNext}
              disabled={step === 'csv' && csvDraft && !csvValidation?.canImport}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg flex items-center gap-2 disabled:opacity-50 transition"
            >
              {step === 'finish' ? 'Start editing' : 'Continue'}
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
