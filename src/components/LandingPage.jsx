// LandingPage.jsx
import React from 'react';
import { Download, QrCode, Layers, Sparkles, ArrowRight, Coffee, BookOpen, FileSpreadsheet } from 'lucide-react';

export default function LandingPage({ onLaunchApp, onLaunchWithSample, onOpenDocs }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans selection:bg-purple-500 selection:text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.28),rgba(15,23,42,0))]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(139,92,246,0.16),transparent_25%),radial-gradient(circle_at_90%_80%,rgba(99,102,241,0.14),transparent_24%)]" />

      <nav className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-violet-500 shadow-lg shadow-purple-500/20 border border-white/10">
              <img src="/favicon.svg" alt="BatchCert logo" className="h-7 w-7" />
            </div>
            <div className="flex flex-col items-start text-left">
              <p className="text-sm font-semibold text-white">Batch<span className="text-purple-300">Cert</span></p>
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Batch Certificate Studio</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenDocs}
              className="hidden md:inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-slate-900/70 px-3 py-2 text-xs font-semibold text-purple-200 transition hover:border-purple-400/40 hover:text-white"
            >
              <BookOpen size="14" className="text-purple-300" /> Docs
            </button>
            <a href="https://ko-fi.com/indiannogibbs" target="_blank" rel="noopener noreferrer" className="hidden md:inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-slate-900/70 px-3 py-2 text-xs font-semibold text-purple-200 transition hover:border-purple-400/40 hover:text-white">
              <Coffee size="14" className="text-purple-300" /> Support
            </a>
            <button 
              onClick={onLaunchApp}
              className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-lg shadow-purple-600/30 transition hover:bg-purple-500"
            >
              Launch Editor <ArrowRight size="14" />
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/70 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-md sm:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.18),transparent_26%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/95 to-slate-950/100" />
          <div className="relative mx-auto max-w-4xl text-center space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-slate-950/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-purple-200 shadow-inner">
              <Sparkles size="14" className="text-purple-300" /> Fast, secure browser-based batch certificates
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              Generate <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-indigo-400 bg-clip-text text-transparent">500+</span> Custom Certificates <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-indigo-400 bg-clip-text text-transparent">Effortlessly</span>
            </h1>

            <p className="mx-auto max-w-2xl text-sm leading-7 text-slate-300 sm:text-base md:text-lg">
              BatchCert gives teams a smooth workflow for CSV-powered certificate generation, dynamic tag mapping, and high-resolution export—all from your browser.
            </p>

            <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
              <button 
                onClick={onLaunchApp}
                className="inline-flex items-center justify-center rounded-full bg-purple-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-purple-600/30 transition hover:bg-purple-500"
              >
                Start Creating For Free <ArrowRight size="18" />
              </button>
              <button
                onClick={onLaunchWithSample}
                className="inline-flex items-center justify-center rounded-full border border-purple-400/40 bg-purple-500/10 px-6 py-4 text-sm font-semibold text-purple-100 transition hover:bg-purple-500/20"
              >
                <FileSpreadsheet size="16" className="mr-2" /> Try Sample Project
              </button>
              <button
                onClick={onOpenDocs}
                className="inline-flex items-center justify-center rounded-full border border-purple-500/30 bg-white/5 px-6 py-4 text-sm font-semibold text-slate-100 transition hover:border-purple-400/40 hover:bg-slate-900"
              >
                <BookOpen size="16" className="mr-2" /> Documentation
              </button>
            </div>
            <div className="mt-8 flex justify-center">
              <a
                href="https://www.producthunt.com/products/batchcert?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-batchcert"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  alt="BatchCert - Generate hundreds of custom certificates instantly 100% free | Product Hunt"
                  width="250"
                  height="54"
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1217253&theme=dark&t=1786242307128"
                />
              </a>
            </div>
          </div>
        </section>

        <section id="features" className="mt-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-purple-300">Feature highlights</p>
            <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">Engineered for scale and simplicity</h2>
            <p className="mt-4 text-slate-300 sm:text-lg">Everything your team needs to generate polished certificates in bulk, without extra infrastructure.</p>
          </div>

          <div className="mt-12 grid w-full grid-cols-1 gap-6 md:grid-cols-3">
            <div className="group rounded-2xl border border-purple-500/20 bg-slate-900/60 p-6 shadow-xl shadow-slate-950/20 backdrop-blur-md transition hover:border-purple-500/40 hover:-translate-y-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-purple-500/15 text-purple-300 shadow-inner">
                <Layers size="22" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-white">Chunked Async Batching</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">Process 500+ certificates smoothly using smart batching and memory-aware export logic to keep the browser responsive.</p>
            </div>

            <div className="group rounded-2xl border border-purple-500/20 bg-slate-900/60 p-6 shadow-xl shadow-slate-950/20 backdrop-blur-md transition hover:border-purple-500/40 hover:-translate-y-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-purple-500/15 text-purple-300 shadow-inner">
                <QrCode size="22" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-white">Local QR Codes</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">Generate verification QR codes locally in your browser — no external API required, works offline in export.</p>
            </div>

            <div className="group rounded-2xl border border-purple-500/20 bg-slate-900/60 p-6 shadow-xl shadow-slate-950/20 backdrop-blur-md transition hover:border-purple-500/40 hover:-translate-y-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-purple-500/15 text-purple-300 shadow-inner">
                <Download size="22" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-white">HD Print Export</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">Export individual PDF ZIP archives or a single multi-page PDF at draft, HD, or ultra-HD quality.</p>
            </div>
          </div>
        </section>

        <section className="mt-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-purple-300">Workflow</p>
            <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">How BatchCert works</h2>
            <p className="mt-4 text-slate-300 sm:text-lg">A guided four-step flow that turns CSV data into polished certificates—fast.</p>
          </div>

          <div className="mt-12 grid w-full grid-cols-1 gap-6 md:grid-cols-4">
            <div className="rounded-2xl border border-purple-500/20 bg-slate-900/60 p-6 text-center shadow-xl shadow-slate-950/20 backdrop-blur-md transition hover:border-purple-500/40 hover:-translate-y-1">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg shadow-purple-600/20">1</div>
              <h3 className="mt-5 text-lg font-semibold text-white">Pick a Template</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">Choose canvas size and background style, or start with the sample project.</p>
            </div>

            <div className="rounded-2xl border border-purple-500/20 bg-slate-900/60 p-6 text-center shadow-xl shadow-slate-950/20 backdrop-blur-md transition hover:border-purple-500/40 hover:-translate-y-1">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg shadow-purple-600/20">2</div>
              <h3 className="mt-5 text-lg font-semibold text-white">Import CSV Data</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">Upload your attendee list and map columns with built-in validation.</p>
            </div>

            <div className="rounded-2xl border border-purple-500/20 bg-slate-900/60 p-6 text-center shadow-xl shadow-slate-950/20 backdrop-blur-md transition hover:border-purple-500/40 hover:-translate-y-1">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg shadow-purple-600/20">3</div>
              <h3 className="mt-5 text-lg font-semibold text-white">Design & Preview</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">Style your layout, add logos, and preview each awardee in the live editor.</p>
            </div>

            <div className="rounded-2xl border border-purple-500/20 bg-slate-900/60 p-6 text-center shadow-xl shadow-slate-950/20 backdrop-blur-md transition hover:border-purple-500/40 hover:-translate-y-1">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg shadow-purple-600/20">4</div>
              <h3 className="mt-5 text-lg font-semibold text-white">Export PDFs</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">Download a ZIP of individual PDFs or one combined multi-page document.</p>
            </div>
          </div>
        </section>

        <section id="docs" className="mt-20 rounded-[32px] border border-purple-500/10 bg-slate-900/70 px-8 py-12 shadow-2xl shadow-slate-950/30">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-purple-300">Documentation</p>
            <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">Everything you need to get started</h2>
            <p className="mt-4 text-slate-300 sm:text-lg">
              CSV format guides, print presets, and export troubleshooting — also available in-app via the Docs button.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onOpenDocs}
                className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-sm font-bold text-white hover:bg-purple-500 transition"
              >
                <BookOpen size="16" /> Open Documentation
              </button>
              <a
                href="/sample-awardees.csv"
                download
                className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 px-6 py-3 text-sm font-semibold text-purple-200 hover:text-white transition"
              >
                <FileSpreadsheet size="16" /> Download Sample CSV
              </a>
            </div>
          </div>
        </section>

        <section className="mt-20 rounded-[32px] border border-purple-500/10 bg-slate-900/70 px-8 py-16 shadow-2xl shadow-slate-950/30">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-purple-300">Ready to go live?</p>
            <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">Launch BatchCert and automate your certificate workflow today.</h2>
            <p className="mt-4 text-slate-300 sm:text-lg">Perfect for course completions, awards, internal recognitions, and compliance training.</p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={onLaunchApp}
                className="inline-flex items-center justify-center rounded-full bg-white px-10 py-4 text-sm font-extrabold text-purple-950 shadow-xl shadow-purple-500/20 transition hover:bg-purple-50"
              >
                Launch BatchCert Editor Now
              </button>
              <button
                onClick={onLaunchWithSample}
                className="inline-flex items-center justify-center rounded-full border border-purple-400/40 px-8 py-4 text-sm font-bold text-purple-100 hover:bg-purple-500/10 transition"
              >
                Try Sample Project First
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800/80 bg-slate-950/95 py-8 text-center text-sm text-slate-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p>© 2026 BatchCert. Created by IndiannoGibbs.</p>
          <div className="mt-4 flex flex-col items-center justify-center gap-3 md:flex-row">
            <a href="https://ko-fi.com/indiannogibbs" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-purple-300 transition hover:text-white">
              <Coffee size="14" /> Support on Ko-fi
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
