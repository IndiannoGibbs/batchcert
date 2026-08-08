import React from 'react';

export default function LoaderOverlay({ visible, title, description }) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/90 backdrop-blur-sm px-4">
      <div className="flex flex-col items-center gap-6 rounded-[32px] border border-white/10 bg-slate-950/95 p-6 shadow-[0_40px_120px_rgba(15,23,42,0.55)] max-w-[380px] w-full">
        <div className="relative w-40 h-56 rounded-[28px] border border-white/15 bg-slate-900/95 overflow-hidden shadow-[0_24px_64px_rgba(15,23,42,0.35)]">
          <div className="absolute inset-x-5 top-5 h-11 rounded-2xl bg-slate-950/95 border border-white/10" />
          <div className="absolute inset-x-5 bottom-5 top-20 rounded-[22px] overflow-hidden bg-slate-950/90 border border-white/10">
            <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-b from-fuchsia-400 via-violet-500 to-sky-400 translate-y-full animate-batchcert-file-fill" />
          </div>
          <div className="absolute inset-x-5 top-24 grid gap-2">
            <div className="h-2 rounded-full bg-white/20 w-3/4" />
            <div className="h-2 rounded-full bg-white/15 w-1/2" />
            <div className="h-2 rounded-full bg-white/15 w-5/6" />
          </div>
          <div className="absolute inset-x-5 bottom-6 grid gap-2">
            <div className="h-3 rounded-full bg-white/10" />
            <div className="h-3 rounded-full bg-white/10 w-4/5" />
            <div className="h-3 rounded-full bg-white/10 w-3/5" />
          </div>
        </div>

        <div className="text-center text-white">
          <p className="text-lg font-semibold">{title}</p>
          <p className="mt-2 text-sm text-slate-300">{description}</p>
        </div>
      </div>
    </div>
  );
}
