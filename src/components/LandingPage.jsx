// LandingPage.jsx
import React, { useState } from 'react';
import {
  Download, QrCode, Layers, Sparkles, ArrowRight, Coffee, BookOpen,
  FileSpreadsheet, Cloud, Shield, Eye, Upload, CheckCircle2, ChevronDown,
} from 'lucide-react';
import LandingProductPreview from './landing/LandingProductPreview';

const FEATURES = [
  {
    icon: FileSpreadsheet,
    title: 'CSV Import & Mapping',
    desc: 'Upload spreadsheets, map columns to name/position fields, and get validation warnings before import.',
  },
  {
    icon: Cloud,
    title: 'Auto-Save & Recovery',
    desc: 'Projects save automatically in your browser. Restore unsaved work when you return.',
  },
  {
    icon: QrCode,
    title: 'Local QR Codes',
    desc: 'Verification QR codes generate in-browser with dynamic tags — no external API, works offline.',
  },
  {
    icon: Download,
    title: 'HD Batch Export',
    desc: 'ZIP of individual PDFs/PNGs or one multi-page PDF at 1x, 2x, or 3x print quality.',
  },
  {
    icon: Eye,
    title: 'Export Preview',
    desc: 'Test one certificate before exporting 100+. See size/time estimates and cancel mid-batch.',
  },
  {
    icon: Layers,
    title: 'Smart Batching',
    desc: 'Chunked async processing keeps the browser responsive for 500+ awardee exports.',
  },
];

const USE_CASES = [
  'Graduation ceremonies',
  'Training completions',
  'Volunteer recognition',
  'Conference attendance',
  'Internal awards',
  'Compliance certificates',
];

const FAQ = [
  {
    q: 'Is BatchCert free?',
    a: 'Yes. BatchCert runs entirely in your browser with no account required. Your data stays on your device unless you export or save a project file.',
  },
  {
    q: 'Does my data leave my computer?',
    a: 'CSV files and project data are processed locally. Nothing is uploaded to a server. Auto-save uses browser localStorage on your machine.',
  },
  {
    q: 'How many certificates can I export at once?',
    a: 'BatchCert is designed for large lists — 100, 500, or more. For very large batches at 3x Ultra HD, use 2x HD to reduce memory use.',
  },
  {
    q: 'What file formats can I export?',
    a: 'Individual PDF or PNG files in a ZIP archive, or a single combined multi-page PDF. Import awardees via CSV.',
  },
];

function FaqItem({ q, a, open, onToggle }) {
  return (
    <div className="border border-purple-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-purple-50/60 transition"
      >
        <span className="text-sm font-semibold text-zinc-900">{q}</span>
        <ChevronDown size={16} className={`text-purple-600 shrink-0 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-zinc-600 leading-relaxed border-t border-purple-100 pt-3">
          {a}
        </div>
      )}
    </div>
  );
}

export default function LandingPage({ onLaunchApp, onLaunchWithSample, onOpenDocs }) {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-zinc-900 font-sans selection:bg-purple-200 selection:text-purple-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(168,85,247,0.12),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_90%,rgba(139,92,246,0.06),transparent_40%)]" />

      <nav className="sticky top-0 z-40 border-b border-purple-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-violet-500 shadow-md shadow-purple-500/20">
              <img src="/favicon.svg" alt="BatchCert logo" className="h-7 w-7" />
            </div>
            <div className="flex flex-col items-start text-left">
              <p className="text-sm font-semibold text-zinc-900">Batch<span className="text-purple-600">Cert</span></p>
              <p className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">Batch Certificate Studio</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenDocs}
              className="hidden md:inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-3 py-2 text-xs font-semibold text-purple-800 transition hover:bg-purple-50"
            >
              <BookOpen size="14" className="text-purple-600" /> Docs
            </button>
            <a
              href="https://ko-fi.com/indiannogibbs"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-3 py-2 text-xs font-semibold text-purple-800 transition hover:bg-purple-50"
            >
              <Coffee size="14" className="text-purple-600" /> Support
            </a>
            <button
              onClick={onLaunchApp}
              className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-md shadow-purple-600/25 transition hover:bg-purple-700"
            >
              Launch <ArrowRight size="14" className="hidden sm:block" />
            </button>
          </div>
        </div>
      </nav>

      <main className="relative mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 sm:py-16">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-purple-100 bg-gradient-to-br from-purple-50/80 via-white to-white shadow-lg shadow-purple-900/5">
          <div className="relative grid lg:grid-cols-2 gap-10 lg:gap-12 p-8 sm:p-10 lg:p-14 items-center">
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-purple-700 shadow-sm">
                <Sparkles size="14" className="text-purple-600" /> 100% browser-based · No signup
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl leading-[1.1]">
                Batch certificates from{' '}
                <span className="text-purple-700">one CSV</span>
              </h1>

              <p className="text-sm leading-7 text-zinc-600 sm:text-base max-w-xl mx-auto lg:mx-0">
                Design one template, import your awardee list, and export hundreds of personalized PDFs — with local QR codes, auto-save, and HD print quality.
              </p>

              <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3">
                <button
                  onClick={onLaunchApp}
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-purple-600 px-8 py-3.5 text-sm font-bold text-white shadow-md shadow-purple-600/25 transition hover:bg-purple-700"
                >
                  Start Creating Free <ArrowRight size="16" className="ml-2" />
                </button>
                <button
                  onClick={onLaunchWithSample}
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-purple-300 bg-white px-6 py-3.5 text-sm font-semibold text-purple-800 transition hover:bg-purple-50"
                >
                  <FileSpreadsheet size="16" className="mr-2" /> Try Sample Project
                </button>
              </div>

              <p className="text-xs text-zinc-500">
                <button onClick={onOpenDocs} className="text-purple-700 hover:text-purple-900 underline underline-offset-2">
                  Read the docs
                </button>
                {' '}· Download{' '}
                <a href="/sample-awardees.csv" download className="text-purple-700 hover:text-purple-900 underline underline-offset-2">
                  sample CSV
                </a>
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2 pt-2">
                {['No server required', 'Offline QR export', 'Auto-save'].map((label) => (
                  <span key={label} className="inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
                    <CheckCircle2 size="12" className="text-emerald-600" /> {label}
                  </span>
                ))}
              </div>
            </div>

            <LandingProductPreview />
          </div>

          <div className="relative border-t border-purple-100 px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/60">
            <a
              href="https://www.producthunt.com/products/batchcert?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-batchcert"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                alt="BatchCert on Product Hunt"
                width="200"
                height="43"
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1217253&theme=neutral&t=1786242307128"
              />
            </a>
            <p className="text-xs text-zinc-500 text-center sm:text-right">
              Trusted for graduations, training programs, and volunteer awards
            </p>
          </div>
        </section>

        {/* Use cases */}
        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {USE_CASES.map((label) => (
              <span
                key={label}
                className="rounded-full border border-purple-200 bg-purple-50/60 px-3.5 py-1.5 text-xs font-medium text-purple-900"
              >
                {label}
              </span>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mt-20">
          <div className="mx-auto max-w-3xl text-center mb-10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-purple-600">How it works</p>
            <h2 className="mt-3 text-3xl font-extrabold text-zinc-900 sm:text-4xl">From spreadsheet to print-ready PDFs</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-700"><Upload size="18" /></div>
                <span className="text-sm font-bold text-zinc-900">1. Import CSV</span>
              </div>
              <div className="rounded-lg border border-purple-100 bg-zinc-50 p-3 font-mono text-[10px] text-emerald-800 leading-relaxed overflow-x-auto">
                Name,Position,Department<br />
                Jane Doe,Student Leader,Council<br />
                John Smith,Volunteer,Outreach<br />
                Maria Garcia,Organizer,Arts
              </div>
              <p className="mt-3 text-xs text-zinc-500">Map columns, validate duplicates, and preview awardees.</p>
            </div>

            <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-700"><Sparkles size="18" /></div>
                <span className="text-sm font-bold text-zinc-900">2. Design once</span>
              </div>
              <div
                className="rounded-lg aspect-[11/8.5] p-3 flex flex-col items-center justify-center text-center border border-purple-100"
                style={{ background: 'linear-gradient(135deg, #faf5ff, #ede9fe)' }}
              >
                <p className="text-[8px] font-bold text-purple-900 uppercase tracking-wider">Certificate of Appreciation</p>
                <p className="text-[11px] font-serif italic text-purple-950 mt-1">{`{{Name}}`}</p>
                <p className="text-[7px] text-purple-800 mt-1">{`{{Position}} · {{Department}}`}</p>
              </div>
              <p className="mt-3 text-xs text-zinc-500">Use {`{{tags}}`} for dynamic fields. Add logos, QR codes, signatures.</p>
            </div>

            <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-700"><Download size="18" /></div>
                <span className="text-sm font-bold text-zinc-900">3. Export batch</span>
              </div>
              <div className="space-y-2">
                {['Jane_Doe.pdf', 'John_Smith.pdf', 'Maria_Garcia.pdf', '+ 118 more…'].map((file, i) => (
                  <div
                    key={file}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
                      i < 3
                        ? 'border-purple-200 bg-purple-50 text-purple-900'
                        : 'border-zinc-100 bg-zinc-50 text-zinc-400'
                    }`}
                  >
                    <FileSpreadsheet size="12" className={i < 3 ? 'text-purple-600' : 'text-zinc-400'} />
                    {file}
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-zinc-500">ZIP archive or single multi-page PDF at HD quality.</p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mt-20">
          <div className="mx-auto max-w-3xl text-center mb-10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-purple-600">Features</p>
            <h2 className="mt-3 text-3xl font-extrabold text-zinc-900 sm:text-4xl">Everything built in — no plugins</h2>
            <p className="mt-3 text-zinc-600 sm:text-lg">Production-ready tools for real batch workflows, not just a template editor.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group rounded-2xl border border-purple-100 bg-white p-5 shadow-sm transition hover:border-purple-300 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                  <Icon size="20" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-zinc-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Privacy */}
        <section className="mt-20 rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-8 sm:px-10 flex flex-col sm:flex-row items-center gap-6">
          <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-700 shrink-0">
            <Shield size="28" />
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-bold text-zinc-900">Your data stays on your device</h3>
            <p className="mt-1 text-sm text-zinc-600 leading-relaxed max-w-2xl">
              BatchCert runs entirely in your browser. CSV files, project data, and exports never leave your machine. No account, no cloud upload, no tracking of your awardee lists.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-20 max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-purple-600">FAQ</p>
            <h2 className="mt-3 text-2xl font-extrabold text-zinc-900 sm:text-3xl">Common questions</h2>
          </div>
          <div className="space-y-2">
            {FAQ.map((item, i) => (
              <FaqItem
                key={item.q}
                q={item.q}
                a={item.a}
                open={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? -1 : i)}
              />
            ))}
          </div>
        </section>

        {/* Docs */}
        <section id="docs" className="mt-20 rounded-3xl border border-purple-100 bg-purple-50/50 px-8 py-12">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-purple-600">Documentation</p>
            <h2 className="mt-4 text-3xl font-extrabold text-zinc-900 sm:text-4xl">Ready to dive in?</h2>
            <p className="mt-4 text-zinc-600 sm:text-lg">
              CSV format guides, print presets, export troubleshooting — also in-app via the Docs button.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onOpenDocs}
                className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-sm font-bold text-white hover:bg-purple-700 transition shadow-sm"
              >
                <BookOpen size="16" /> Open Documentation
              </button>
              <a
                href="/sample-awardees.csv"
                download
                className="inline-flex items-center gap-2 rounded-full border border-purple-300 bg-white px-6 py-3 text-sm font-semibold text-purple-800 hover:bg-purple-50 transition"
              >
                <FileSpreadsheet size="16" /> Download Sample CSV
              </a>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mt-16 mb-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">Create your first batch in minutes</h2>
          <p className="mt-3 text-zinc-600 text-sm sm:text-base">Start blank or explore the sample project with 3 pre-loaded awardees.</p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onLaunchApp}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-purple-600 px-10 py-4 text-sm font-extrabold text-white shadow-md shadow-purple-600/20 transition hover:bg-purple-700"
            >
              Launch Editor
            </button>
            <button
              onClick={onLaunchWithSample}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-purple-300 bg-white px-8 py-4 text-sm font-bold text-purple-800 hover:bg-purple-50 transition"
            >
              Open Sample Project
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-purple-100 bg-purple-50/40 py-8 text-center text-sm text-zinc-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p>© 2026 BatchCert. Created by IndiannoGibbs.</p>
          <div className="mt-4 flex flex-col items-center justify-center gap-3 md:flex-row">
            <button onClick={onOpenDocs} className="inline-flex items-center gap-2 text-sm font-semibold text-purple-700 transition hover:text-purple-900">
              <BookOpen size="14" /> Documentation
            </button>
            <span className="hidden md:inline text-purple-200">·</span>
            <a href="https://ko-fi.com/indiannogibbs" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-purple-700 transition hover:text-purple-900">
              <Coffee size="14" /> Support on Ko-fi
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
