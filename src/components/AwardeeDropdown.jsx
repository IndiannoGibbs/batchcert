import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, Check } from 'lucide-react';

export default function AwardeeDropdown({
  isOpen,
  onClose,
  awardees,
  currentAwardeeIdx,
  searchQuery,
  setSearchQuery,
  onSelectAwardee,
}) {
  const dropdownRef = useRef(null);
  const query = searchQuery.trim().toLowerCase();

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('touchstart', handleClickOutside);

    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const matches = awardees
    .map((a, idx) => ({ ...a, originalIdx: idx }))
    .filter(a =>
      !query
      || (a.name || '').toLowerCase().includes(query)
      || (a.position || '').toLowerCase().includes(query)
    );

  return createPortal(
    <div ref={dropdownRef} className="fixed top-14 left-4 z-[9999] w-80 bg-white/95 backdrop-blur-md border border-purple-200 rounded-2xl shadow-2xl p-2 space-y-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex items-center gap-1 bg-purple-50 px-2 py-1.5 rounded-lg border border-purple-200">
        <Search size={13} className="text-purple-600" />
        <input
          type="text"
          placeholder="Search by name or position…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent text-xs text-zinc-900 focus:outline-none w-full font-medium"
          autoFocus
        />
      </div>

      {query && (
        <p className="text-[10px] font-bold text-purple-900 uppercase px-1">
          {matches.length} match{matches.length === 1 ? '' : 'es'} in {awardees.length} awardees
        </p>
      )}

      <div className="max-h-56 overflow-y-auto space-y-1">
        {matches.length === 0 ? (
          <p className="text-xs text-zinc-500 px-2 py-3">No awardees match your search.</p>
        ) : matches.map((a) => (
          <button
            key={a.id || a.originalIdx}
            onClick={() => {
              onSelectAwardee(a.originalIdx);
              setSearchQuery('');
              onClose();
            }}
            className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition border ${
              currentAwardeeIdx === a.originalIdx
                ? 'border-purple-600 bg-purple-100 text-purple-950'
                : 'border-transparent hover:bg-purple-50 text-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-purple-800 shrink-0">
                #{a.originalIdx + 1} of {awardees.length}
              </span>
              {currentAwardeeIdx === a.originalIdx && (
                <Check size={12} className="text-purple-700 shrink-0" />
              )}
            </div>
            <p className="font-semibold text-zinc-900 truncate mt-0.5">{a.name || '(Unnamed)'}</p>
            {a.position && (
              <p className="text-[11px] text-zinc-500 truncate">{a.position}</p>
            )}
          </button>
        ))}
      </div>
    </div>,
    document.body
  );
}
