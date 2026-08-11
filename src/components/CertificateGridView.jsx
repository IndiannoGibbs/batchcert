import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, LayoutGrid, Pencil, Search, X } from 'lucide-react';
import CertificatePreview from './CertificatePreview.jsx';

function CertificateGridCard({
  awardee,
  index,
  total,
  isSelected,
  canvasSize,
  bgType,
  customBg,
  bgTransform,
  logoImg,
  globalData,
  elements,
  signatories,
  onSelect,
  onEdit,
}) {
  const frameRef = useRef(null);
  const [scale, setScale] = useState(0.2);

  useEffect(() => {
    const node = frameRef.current;
    if (!node) return undefined;

    const updateScale = () => {
      const width = node.clientWidth;
      if (width > 0) {
        setScale(width / canvasSize.width);
      }
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(node);
    return () => observer.disconnect();
  }, [canvasSize.width]);

  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      onDoubleClick={(event) => {
        event.preventDefault();
        onEdit(index);
      }}
      className={`group text-left rounded-2xl border bg-white shadow-sm transition overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${
        isSelected
          ? 'border-purple-600 ring-2 ring-purple-300 shadow-lg shadow-purple-200/60'
          : 'border-purple-100 hover:border-purple-300 hover:shadow-md'
      }`}
      title="Click to select · double-click to edit"
    >
      <div
        ref={frameRef}
        className="relative w-full overflow-hidden bg-slate-100"
        style={{ aspectRatio: `${canvasSize.width} / ${canvasSize.height}` }}
      >
        <div
          className="absolute top-0 left-0 origin-top-left pointer-events-none"
          style={{
            width: `${canvasSize.width}px`,
            height: `${canvasSize.height}px`,
            transform: `scale(${scale})`,
          }}
        >
          <CertificatePreview
            awardee={awardee}
            canvasSize={canvasSize}
            bgType={bgType}
            customBg={customBg}
            bgTransform={bgTransform}
            logoImg={logoImg}
            globalData={globalData}
            elements={elements}
            signatories={signatories}
          />
        </div>

        {isSelected && (
          <div className="absolute top-2 right-2 rounded-full bg-purple-600 text-white p-1 shadow-md">
            <Check size={12} />
          </div>
        )}

        {awardee.hasCustomLayout && (
          <div className="absolute top-2 left-2 rounded-full bg-amber-100 border border-amber-300 text-amber-900 px-2 py-0.5 text-[10px] font-bold uppercase">
            Custom
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-3 py-2 opacity-0 group-hover:opacity-100 transition">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-white">
            <Pencil size={12} />
            Edit certificate
          </span>
        </div>
      </div>

      <div className="px-3 py-2.5 space-y-0.5 border-t border-purple-50">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wide text-purple-700">
            #{index + 1} of {total}
          </span>
          {isSelected && (
            <span className="text-[10px] font-bold uppercase text-emerald-700">Selected</span>
          )}
        </div>
        <p className="font-semibold text-sm text-zinc-900 truncate">{awardee.name || '(Unnamed Awardee)'}</p>
        {awardee.position && (
          <p className="text-[11px] text-zinc-500 truncate">{awardee.position}</p>
        )}
      </div>
    </button>
  );
}

export default function CertificateGridView({
  awardees,
  currentAwardeeIdx,
  canvasSize,
  bgType,
  customBg,
  bgTransform,
  logoImg,
  globalData,
  elements,
  signatories,
  onSelectAwardee,
  onEditAwardee,
  onExitGrid,
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAwardees = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return awardees
      .map((awardee, index) => ({ awardee, index }))
      .filter(({ awardee }) => {
        if (!query) return true;
        return (awardee.name || '').toLowerCase().includes(query)
          || (awardee.position || '').toLowerCase().includes(query);
      });
  }, [awardees, searchQuery]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-purple-50/20">
      <div className="shrink-0 border-b border-purple-200 bg-white/95 backdrop-blur px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-2 rounded-xl bg-purple-100 text-purple-700 shrink-0">
            <LayoutGrid size={16} />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-purple-950">Grid View</h2>
            <p className="text-[11px] text-zinc-500">
              {filteredAwardees.length} of {awardees.length} certificates · click to select · double-click to edit
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-200 rounded-xl px-2.5 py-1.5 shadow-sm flex-1 sm:flex-none sm:min-w-[220px]">
            <Search size={14} className="text-purple-600 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search certificates…"
              className="bg-transparent text-xs text-zinc-900 focus:outline-none w-full font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-zinc-400 hover:text-zinc-600 shrink-0"
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onExitGrid}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-purple-200 bg-white hover:bg-purple-50 text-purple-900 text-xs font-bold transition shadow-sm"
          >
            Back to Editor
          </button>

          <button
            type="button"
            onClick={() => onEditAwardee(currentAwardeeIdx)}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-sm"
          >
            <Pencil size={13} />
            Edit Selected
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 sm:p-6">
        {filteredAwardees.length === 0 ? (
          <div className="h-full min-h-[240px] flex items-center justify-center rounded-2xl border border-dashed border-purple-200 bg-white/70 text-sm text-zinc-500">
            No certificates match your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {filteredAwardees.map(({ awardee, index }) => (
              <CertificateGridCard
                key={awardee.id || index}
                awardee={awardee}
                index={index}
                total={awardees.length}
                isSelected={currentAwardeeIdx === index}
                canvasSize={canvasSize}
                bgType={bgType}
                customBg={customBg}
                bgTransform={bgTransform}
                logoImg={logoImg}
                globalData={globalData}
                elements={elements}
                signatories={signatories}
                onSelect={onSelectAwardee}
                onEdit={onEditAwardee}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
