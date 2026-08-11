import React, { useState } from 'react';
import { BookOpen, X, ChevronDown, ChevronRight } from 'lucide-react';

const SECTIONS = [
  {
    id: 'quickstart',
    title: 'Quick Start',
    content: (
      <div className="space-y-3 text-sm text-zinc-700 leading-relaxed">
        <ol className="list-decimal pl-5 space-y-2">
          <li>Launch the editor and complete the setup wizard (or load the sample project).</li>
          <li>Import a CSV awardee list from the <strong>Data</strong> tab.</li>
          <li>Design your layout in the <strong>Design</strong> tab — drag text, logos, and QR codes.</li>
          <li>Use <code className="bg-purple-50 px-1 rounded text-purple-900">{`{{ColumnName}}`}</code> tags for dynamic CSV fields.</li>
          <li>Export via the sidebar: ZIP archive or single multi-page PDF.</li>
        </ol>
        <p>Projects auto-save to your browser. Use <strong>Save</strong> in the top bar to download a <code>.json</code> backup.</p>
      </div>
    ),
  },
  {
    id: 'csv',
    title: 'CSV Format',
    content: (
      <div className="space-y-3 text-sm text-zinc-700 leading-relaxed">
        <p>Your CSV must include a <strong>header row</strong> followed by data rows. BatchCert maps columns during import.</p>
        <pre className="bg-zinc-900 text-emerald-300 p-3 rounded-lg text-xs overflow-x-auto">{`Name,Position,Department
Jane Doe,Student Leader,Student Council
John Smith,Volunteer,Outreach`}</pre>
        <p><strong>Recognized name columns:</strong> Name, Full Name, Awardee Name</p>
        <p><strong>Recognized position columns:</strong> Position, Title, Role</p>
        <p>Any other column becomes a dynamic tag: <code className="bg-purple-50 px-1 rounded">{`{{Department}}`}</code></p>
        <p>
          <a href="/sample-awardees.csv" download className="text-purple-700 font-semibold hover:underline">
            Download sample CSV template
          </a>
        </p>
      </div>
    ),
  },
  {
    id: 'canvas',
    title: 'Canvas Presets for Print',
    content: (
      <div className="space-y-3 text-sm text-zinc-700 leading-relaxed">
        <table className="w-full text-xs border border-purple-100 rounded-lg overflow-hidden">
          <thead className="bg-purple-50">
            <tr>
              <th className="text-left p-2 font-bold text-purple-900">Preset</th>
              <th className="text-left p-2 font-bold text-purple-900">Size (px)</th>
              <th className="text-left p-2 font-bold text-purple-900">Best for</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-purple-50"><td className="p-2">US Letter Landscape</td><td className="p-2">1100×850</td><td className="p-2">Standard US print (recommended)</td></tr>
            <tr className="border-t border-purple-50"><td className="p-2">US Letter Portrait</td><td className="p-2">850×1100</td><td className="p-2">Vertical certificates</td></tr>
            <tr className="border-t border-purple-50"><td className="p-2">A4 Landscape</td><td className="p-2">1123×794</td><td className="p-2">International print</td></tr>
            <tr className="border-t border-purple-50"><td className="p-2">A4 Portrait</td><td className="p-2">794×1123</td><td className="p-2">International vertical</td></tr>
          </tbody>
        </table>
        <p>Change preset in <strong>Design → Canvas Size</strong>. Match your background image aspect ratio to avoid white margins.</p>
        <p>Use <strong>2x HD</strong> export scale for print; <strong>3x Ultra HD</strong> for large-format or archival quality.</p>
      </div>
    ),
  },
  {
    id: 'export',
    title: 'Export Troubleshooting',
    content: (
      <div className="space-y-3 text-sm text-zinc-700 leading-relaxed">
        <div>
          <p className="font-semibold text-zinc-900">PDF shows wrong orientation (portrait instead of landscape)</p>
          <p className="mt-1">Ensure canvas width is greater than height. US Letter Landscape is 1100×850. Re-export after selecting the correct preset.</p>
        </div>
        <div>
          <p className="font-semibold text-zinc-900">White space or clipped content on export</p>
          <p className="mt-1">Use a canvas preset that matches your background image. Custom backgrounds should fill 100% width/height in Design settings.</p>
        </div>
        <div>
          <p className="font-semibold text-zinc-900">Fonts look different in PDF</p>
          <p className="mt-1">Wait for fonts to load before exporting. Google Fonts are embedded at capture time — avoid switching awardees mid-export.</p>
        </div>
        <div>
          <p className="font-semibold text-zinc-900">Large batches (100+) feel slow</p>
          <p className="mt-1">Use 2x scale instead of 3x. Export in chunks via &quot;Choose Specific&quot; in the export modal. Close other browser tabs to free memory.</p>
        </div>
        <div>
          <p className="font-semibold text-zinc-900">QR codes missing in export</p>
          <p className="mt-1">QR codes are generated locally in-browser. If a code shows a loading pulse, wait a moment before exporting.</p>
        </div>
      </div>
    ),
  },
  {
    id: 'tags',
    title: 'Dynamic Tags',
    content: (
      <div className="space-y-3 text-sm text-zinc-700 leading-relaxed">
        <p>Insert tags into text elements to pull awardee-specific data:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><code className="bg-purple-50 px-1 rounded">{`{{Name}}`}</code> — awardee name from CSV</li>
          <li><code className="bg-purple-50 px-1 rounded">{`{{Position}}`}</code> — awardee position</li>
          <li><code className="bg-purple-50 px-1 rounded">{`{{Department}}`}</code> — any custom CSV column</li>
        </ul>
        <p>Built-in fields (org name, date line, body template) are edited in the <strong>Data</strong> tab and apply to all certificates.</p>
      </div>
    ),
  },
];

export default function DocsModal({ isOpen, onClose }) {
  const [openSection, setOpenSection] = useState('quickstart');

  if (!isOpen) return null;

  const active = SECTIONS.find(s => s.id === openSection);

  return (
    <div className="fixed inset-0 z-[65] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-purple-200 rounded-xl w-[720px] max-h-[85vh] flex flex-col shadow-2xl">
        <div className="p-4 border-b border-purple-100 flex justify-between items-center bg-purple-50/50 rounded-t-xl">
          <h3 className="text-sm font-bold text-purple-900 uppercase tracking-wider flex items-center gap-2">
            <BookOpen size={16} className="text-purple-700" /> BatchCert Documentation
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 p-1">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-1 min-h-0">
          <nav className="w-44 shrink-0 border-r border-purple-100 p-2 overflow-y-auto bg-purple-50/20">
            {SECTIONS.map(section => (
              <button
                key={section.id}
                onClick={() => setOpenSection(section.id)}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition mb-0.5 ${openSection === section.id ? 'bg-purple-100 text-purple-900' : 'text-zinc-600 hover:bg-white'}`}
              >
                {section.title}
                {openSection === section.id ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>
            ))}
          </nav>
          <div className="flex-1 p-5 overflow-y-auto">
            <h4 className="text-lg font-bold text-zinc-900 mb-4">{active?.title}</h4>
            {active?.content}
          </div>
        </div>

        <div className="p-4 border-t border-purple-100 bg-purple-50/50 flex justify-end rounded-b-xl">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
