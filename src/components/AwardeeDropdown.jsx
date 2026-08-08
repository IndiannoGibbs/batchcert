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
  onSelectAwardee
}) {
  const dropdownRef = useRef(null);

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

  return createPortal(
    <div ref={dropdownRef} className="fixed top-14 left-4 z-[9999] w-72 bg-white/95 backdrop-blur-md border border-purple-200 rounded-2xl shadow-2xl p-2 space-y-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex items-center gap-1 bg-purple-50 px-2 py-1.5 rounded-lg border border-purple-200">
        <Search size={13} className="text-purple-600" />
        <input 
          type="text"
          placeholder="Search awardee..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent text-xs text-zinc-900 focus:outline-none w-full font-medium"
          autoFocus
        />
      </div>

      <div className="max-h-48 overflow-y-auto space-y-1">
        {awardees
          .map((a, idx) => ({ ...a, originalIdx: idx }))
          .filter(a => (a.name || '').toLowerCase().includes(searchQuery.toLowerCase()))
          .map((a) => (
            <button
              key={a.id || a.originalIdx}
              onClick={() => {
                onSelectAwardee(a.originalIdx);
                setSearchQuery('');
                onClose();
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition ${currentAwardeeIdx === a.originalIdx ? 'bg-purple-100 text-purple-950 font-bold' : 'hover:bg-purple-50 text-zinc-700'}`}
            >
              <span className="truncate">{a.originalIdx + 1}. {a.name || '(Unnamed)'}</span>
              {currentAwardeeIdx === a.originalIdx && <Check size={12} className="text-purple-700" />}
            </button>
          ))}
      </div>
    </div>,
    document.body
  );
}
