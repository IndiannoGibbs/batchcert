import React from 'react';

export default function LandingProductPreview() {
  return (
    <div className="relative w-full max-w-2xl mx-auto lg:mx-0 lg:max-w-none">
      <div className="absolute -inset-3 rounded-2xl bg-purple-200/40 blur-2xl" aria-hidden />

      <div className="relative rounded-xl border border-purple-200 bg-white shadow-xl shadow-purple-900/10 overflow-hidden">
        <img
          src="/screenshots/editor-preview.png"
          alt="BatchCert editor showing a Certificate of Appreciation for Jane Doe with sidebar controls and export options"
          className="w-full h-auto block"
          loading="eager"
          decoding="async"
        />
      </div>

      <p className="mt-3 text-center lg:text-left text-xs text-zinc-500">
        Sample project · Jane Doe · Awardee 1 of 3
      </p>
    </div>
  );
}
