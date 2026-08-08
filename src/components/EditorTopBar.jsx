import React from 'react';
import { FilePlus, FolderOpen, Save, HelpCircle } from 'lucide-react';

export default function EditorTopBar({
  handleExitToHome,
  handleNewProject,
  handleLoadProjectFromFile,
  handleSaveProject,
  projectName,
  setProjectName,
  setIsKeyboardModalOpen
}) {
  return (
    <div className="h-12 bg-white border-b border-purple-200 flex items-center justify-between px-4 z-30 shadow-sm">
      <div className="flex items-center gap-4">
        <button 
          onClick={handleExitToHome}
          className="text-xs font-extrabold text-purple-900 tracking-wider hover:underline flex items-center gap-1"
        >
          ← Exit to Home
        </button>

        <span className="text-xs font-extrabold text-purple-900 tracking-wider flex items-center gap-1.5 uppercase">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 100" width="100%" height="100%" className="h-9 w-auto flex-shrink-0">
            <defs>
              <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9333ea" />
                <stop offset="100%" stopColor="#581c87" />
              </linearGradient>
            </defs>
            <g transform="translate(10, 15) scale(0.75)">
              <rect x="12" y="12" width="64" height="64" rx="8" fill="#f3e8ff" opacity="0.6" />
              <rect x="4" y="4" width="64" height="64" rx="8" fill="url(#purpleGradient)" />
              <line x1="16" y1="20" x2="44" y2="20" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
              <line x1="16" y1="32" x2="56" y2="32" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
              <line x1="16" y1="44" x2="36" y2="44" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
              <circle cx="50" cy="50" r="14" fill="#ffffff" />
              <path d="M44 50 L48 54 L57 44" fill="none" stroke="#581c87" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <text x="80" y="58" fontFamily="'Inter', 'Helvetica', sans-serif" fontSize="28" fontWeight="800" fill="#581c87" letterSpacing="-0.5">
              Batch<tspan fontWeight="400" fill="#9333ea">Cert</tspan>
            </text>
          </svg>
        </span>

        <div className="flex items-center gap-1 text-xs">
          <button 
            onClick={handleNewProject}
            className="px-2.5 py-1.5 hover:bg-purple-50 text-zinc-700 rounded font-medium flex items-center gap-1 transition"
          >
            <FilePlus size={13} className="text-purple-600" /> New
          </button>

          <label className="px-2.5 py-1.5 hover:bg-purple-50 text-zinc-700 rounded font-medium flex items-center gap-1 cursor-pointer transition">
            <FolderOpen size={13} className="text-purple-600" /> Open
            <input type="file" accept=".json" onChange={handleLoadProjectFromFile} className="hidden" />
          </label>

          <button 
            onClick={handleSaveProject}
            className="px-2.5 py-1.5 hover:bg-purple-50 text-zinc-700 rounded font-medium flex items-center gap-1 transition"
          >
            <Save size={13} className="text-purple-600" /> Save
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-zinc-500 font-medium">Project Name:</span>
          <input 
            type="text" 
            value={projectName} 
            onChange={(e) => setProjectName(e.target.value)}
            className="bg-purple-50/60 border border-purple-200 text-xs text-purple-950 font-semibold px-2.5 py-1 rounded focus:outline-none focus:border-purple-600 w-44 shadow-inner"
          />
        </div>

        <button
          onClick={() => setIsKeyboardModalOpen(true)}
          className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-full transition shadow-sm flex items-center justify-center"
          title="Keyboard Shortcuts Cheat Sheet"
        >
          <HelpCircle size={16} className="text-purple-700" />
        </button>
      </div>
    </div>
  );
}
