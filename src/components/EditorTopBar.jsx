import React from 'react';
import { FilePlus, FolderOpen, Save, HelpCircle, Cloud, BookOpen, Sparkles, ArrowLeft } from 'lucide-react';

const toolbarBtn =
  'shrink-0 whitespace-nowrap px-2 py-1 hover:bg-purple-50 text-zinc-700 rounded font-medium inline-flex items-center gap-1 transition text-xs';

export default function EditorTopBar({
  handleExitToHome,
  handleNewProject,
  handleLoadProjectFromFile,
  handleSaveProject,
  projectName,
  setProjectName,
  setIsKeyboardModalOpen,
  autoSaveLabel,
  autoSaveTitle,
  onOpenDocs,
  onOpenOnboarding,
}) {
  return (
    <div className="h-12 min-h-12 bg-white border-b border-purple-200 flex items-center gap-2 px-3 z-30 shadow-sm overflow-hidden">
      {/* Left: exit + brand + file actions */}
      <div className="flex items-center gap-2 min-w-0 shrink-0">
        <button
          onClick={handleExitToHome}
          className={`${toolbarBtn} font-extrabold text-purple-900 tracking-wide`}
          title="Exit to Home"
        >
          <ArrowLeft size={13} className="text-purple-700" />
          Exit
        </button>

        <div className="h-5 w-px bg-purple-200 shrink-0" aria-hidden />

        <img src="/favicon.svg" alt="BatchCert" className="h-7 w-7 shrink-0" />

        <div className="flex items-center gap-0.5 shrink-0">
          <button onClick={onOpenOnboarding} className={toolbarBtn} title="Reopen setup wizard">
            <Sparkles size={13} className="text-purple-600 shrink-0" />
            Setup
          </button>
          <button onClick={onOpenDocs} className={toolbarBtn} title="Open documentation">
            <BookOpen size={13} className="text-purple-600 shrink-0" />
            Docs
          </button>
          <button onClick={handleNewProject} className={toolbarBtn}>
            <FilePlus size={13} className="text-purple-600 shrink-0" />
            New
          </button>
          <label className={`${toolbarBtn} cursor-pointer`}>
            <FolderOpen size={13} className="text-purple-600 shrink-0" />
            Open
            <input type="file" accept=".json" onChange={handleLoadProjectFromFile} className="hidden" />
          </label>
          <button onClick={handleSaveProject} className={toolbarBtn}>
            <Save size={13} className="text-purple-600 shrink-0" />
            Save
          </button>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1 min-w-2" />

      {/* Right: status + project name + help */}
      <div className="flex items-center gap-2 shrink-0 min-w-0">
        {autoSaveLabel && (
          <span
            title={autoSaveTitle || autoSaveLabel}
            className="hidden lg:inline-flex shrink-0 whitespace-nowrap items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium leading-none"
          >
            <Cloud size={11} className="shrink-0" />
            {autoSaveLabel}
          </span>
        )}

        <div className="flex items-center gap-1.5 shrink min-w-0">
          <span className="shrink-0 whitespace-nowrap text-[11px] text-zinc-500 font-medium">Project</span>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            title={projectName}
            className="min-w-0 w-28 sm:w-36 md:w-44 max-w-[11rem] sm:max-w-[14rem] md:max-w-none bg-purple-50/60 border border-purple-200 text-xs text-purple-950 font-semibold px-2 py-1 rounded focus:outline-none focus:border-purple-600 shadow-inner truncate"
          />
        </div>

        <button
          onClick={() => setIsKeyboardModalOpen(true)}
          className="shrink-0 p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-full transition shadow-sm flex items-center justify-center"
          title="Keyboard Shortcuts Cheat Sheet"
        >
          <HelpCircle size={16} className="text-purple-700" />
        </button>
      </div>
    </div>
  );
}
