// LandingPage.jsx
import React from 'react';
import { Download, Upload, QrCode, Layers, ShieldCheck, Sparkles, ArrowRight, CheckCircle2, Coffee } from 'lucide-react';

export default function LandingPage({ onLaunchApp }) {
  return (
    <div className="min-h-screen bg-purple-950 text-white font-sans selection:bg-purple-500 selection:text-white">
      {/* NAVBAR */}
      <nav className="h-16 border-b border-purple-900 px-6 flex items-center justify-between sticky top-0 bg-purple-950/90 backdrop-blur z-40">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 100" className="h-8 w-auto">
            <defs>
              <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#9333ea" />
              </linearGradient>
            </defs>
            <g transform="translate(10, 15) scale(0.75)">
              <rect x="12" y="12" width="64" height="64" rx="8" fill="#581c87" opacity="0.6" />
              <rect x="4" y="4" width="64" height="64" rx="8" fill="url(#purpleGrad)" />
              <line x1="16" y1="20" x2="44" y2="20" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
              <line x1="16" y1="32" x2="56" y2="32" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
              <circle cx="50" cy="50" r="14" fill="#ffffff" />
              <path d="M44 50 L48 54 L57 44" fill="none" stroke="#581c87" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <text x="80" y="58" fontFamily="'Inter', sans-serif" fontSize="28" fontWeight="800" fill="#ffffff">
              Batch<tspan fontWeight="400" fill="#c084fc">Cert</tspan>
            </text>
          </svg>
        </div>

        <div className="flex items-center gap-4">
          <a href="https://ko-fi.com/indiannogibbs" target="_blank" rel="noopener noreferrer" className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-purple-200 hover:text-white transition">
            <Coffee size={14} className="text-[#29abe0]" /> Support
          </a>
          <button 
            onClick={onLaunchApp}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-900/50 transition flex items-center gap-1.5 border border-purple-400/30"
          >
            Launch Editor <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="px-6 py-24 max-w-6xl mx-auto text-center space-y-8 bg-gradient-to-b from-purple-950 via-purple-900/50 to-purple-950">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-900/60 border border-purple-700/60 text-purple-200 text-xs font-bold shadow-inner">
          <Sparkles size={13} className="text-purple-400" /> Fast, Secure & Browser-Based Bulk Generation
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Generate 500+ Custom Certificates <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-purple-400 to-purple-200">In Seconds</span>
        </h1>

        <p className="max-w-2xl mx-auto text-purple-200/80 text-sm md:text-base leading-relaxed">
          The ultimate batch certificate creator for educators, event organizers, and HR professionals. Import CSV data, map dynamic tags, and export high-resolution PDFs instantly.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={onLaunchApp}
            className="w-full sm:w-auto px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm rounded-2xl shadow-2xl shadow-purple-900 transition flex items-center justify-center gap-2 border border-purple-400/30"
          >
            Start Creating For Free <ArrowRight size={16} />
          </button>
          <a 
            href="#features"
            className="w-full sm:w-auto px-6 py-4 bg-purple-900/40 hover:bg-purple-900/70 text-purple-100 font-bold text-sm rounded-2xl border border-purple-700/50 transition text-center shadow-inner"
          >
            Explore Features
          </a>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section id="features" className="py-20 bg-purple-900/20 border-y border-purple-900/60 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">Engineered For Scale & Simplicity</h2>
            <p className="text-purple-300/80 text-xs md:text-sm">Everything you need to produce professional certificates without breaking a sweat.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-purple-900/30 backdrop-blur p-6 rounded-2xl border border-purple-800/60 shadow-xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-800/80 flex items-center justify-center text-purple-200 border border-purple-600/40">
                <Layers size={20} />
              </div>
              <h3 className="font-bold text-white text-sm">Chunked Async Batching</h3>
              <p className="text-purple-200/70 text-xs leading-relaxed">Process 500+ certificates smoothly with yield loops and explicit memory cleanup preventing browser crashes.</p>
            </div>

            <div className="bg-purple-900/30 backdrop-blur p-6 rounded-2xl border border-purple-800/60 shadow-xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-800/80 flex items-center justify-center text-purple-200 border border-purple-600/40">
                <QrCode size={20} />
              </div>
              <h3 className="font-bold text-white text-sm">Dynamic QR Verification</h3>
              <p className="text-purple-200/70 text-xs leading-relaxed">Bind unique CSV tags to instantly generate anti-counterfeit verification links for every awardee.</p>
            </div>

            <div className="bg-purple-900/30 backdrop-blur p-6 rounded-2xl border border-purple-800/60 shadow-xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-800/80 flex items-center justify-center text-purple-200 border border-purple-600/40">
                <Download size={20} />
              </div>
              <h3 className="font-bold text-white text-sm">HD Print Resolution</h3>
              <p className="text-purple-200/70 text-xs leading-relaxed">Export quality toggles (1x draft, 2x HD, 3x Ultra-HD) tailored for professional printing or digital sharing.</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-6 max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">How BatchCert Works</h2>
          <p className="text-purple-300/80 text-xs md:text-sm">Create and export your entire batch in three straightforward steps.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3 text-center bg-purple-900/20 p-6 rounded-2xl border border-purple-900">
            <div className="w-12 h-12 rounded-full bg-purple-600 text-white font-bold text-base flex items-center justify-center mx-auto shadow-lg shadow-purple-900">1</div>
            <h3 className="font-bold text-white text-sm">Import CSV Data</h3>
            <p className="text-purple-200/70 text-xs leading-relaxed">Upload your spreadsheet containing awardee names, designations, and custom tracking IDs.</p>
          </div>

          <div className="space-y-3 text-center bg-purple-900/20 p-6 rounded-2xl border border-purple-900">
            <div className="w-12 h-12 rounded-full bg-purple-600 text-white font-bold text-base flex items-center justify-center mx-auto shadow-lg shadow-purple-900">2</div>
            <h3 className="font-bold text-white text-sm">Design & Position</h3>
            <p className="text-purple-200/70 text-xs leading-relaxed">Customize fonts, background styles, logos, and layout dimensions right on the visual canvas.</p>
          </div>

          <div className="space-y-3 text-center bg-purple-900/20 p-6 rounded-2xl border border-purple-900">
            <div className="w-12 h-12 rounded-full bg-purple-600 text-white font-bold text-base flex items-center justify-center mx-auto shadow-lg shadow-purple-900">3</div>
            <h3 className="font-bold text-white text-sm">Export ZIP Archive</h3>
            <p className="text-purple-200/70 text-xs leading-relaxed">Download a structured ZIP folder packed with individual PDFs or high-resolution PNGs.</p>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="bg-gradient-to-r from-purple-900 via-purple-800 to-purple-950 text-white py-20 px-6 text-center space-y-6 border-y border-purple-800">
        <h2 className="text-2xl md:text-4xl font-extrabold">Ready to streamline your certificate workflow?</h2>
        <p className="text-purple-200 text-xs md:text-sm max-w-xl mx-auto">Join educators and professionals saving hours of manual formatting work.</p>
        <button 
          onClick={onLaunchApp}
          className="px-8 py-4 bg-white text-purple-950 hover:bg-purple-100 font-bold text-sm rounded-2xl shadow-2xl transition border border-white/20"
        >
          Launch BatchCert Editor Now
        </button>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-purple-900 py-8 px-6 text-center text-xs text-purple-300/70 space-y-2 bg-purple-950">
        <p>© 2026 BatchCert. Created by IndiannoGibbs.</p>
        <div className="flex items-center justify-center gap-4">
          <a href="https://ko-fi.com/indiannogibbs" target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-white underline font-semibold flex items-center gap-1">
            <Coffee size={12} className="text-[#29abe0]" /> Support on Ko-fi
          </a>
        </div>
      </footer>
    </div>
  );
}