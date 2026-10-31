import React from 'react';
import { ArrowRight, Mic, ShieldCheck, TrendingUp, Layers, CheckCircle2, Sparkles, Store } from 'lucide-react';

export default function LandingPage({ onLaunchDemo, onLogin, onRegister }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-paytm-bg to-white text-paytm-navy">
      {/* Top Bar */}
      <header className="border-b border-[#E5E7EB] bg-white px-6 py-3 max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="/paytm-for-business.png" 
            alt="Paytm for Business" 
            className="h-9 w-auto object-contain"
          />
          <div className="h-6 w-px bg-[#E5E7EB] hidden sm:block" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg text-[#002970] tracking-tight">Gullak AI</span>
              <span className="text-[10px] font-bold bg-[#002970]/10 text-[#002970] px-2 py-0.5 rounded">Merchant Co-pilot</span>
            </div>
            <p className="text-xs text-[#6B7280] font-medium hidden sm:block">Sense. Think. Act. Learn. — Real Kirana Intelligence</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onLogin}
            className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-paytm-blue transition"
          >
            Log In
          </button>
          <button
            onClick={onLaunchDemo}
            className="px-5 py-2.5 bg-gradient-to-r from-paytm-cyan to-paytm-blue text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg active:scale-95 transition"
          >
            Launch Demo Store
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-paytm-blue text-xs font-bold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Multilingual Agentic Merchant Intelligence for Indian Retail</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-paytm-navy tracking-tight leading-[1.15] mb-6">
          Sense. Think. Act. Learn.<br />
          <span className="bg-gradient-to-r from-paytm-cyan via-paytm-blue to-indigo-600 bg-clip-text text-transparent">
            Your Store's Autonomous AI Partner.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
          Gullak AI listens in Hindi, Marathi, and English to forecast festive stockouts, draft wholesale orders, re-engage inactive customers via WhatsApp, and govern every action with full merchant consent.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          <button
            onClick={onLaunchDemo}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-paytm-cyan to-paytm-blue text-white font-extrabold text-base rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition flex items-center justify-center gap-2"
          >
            <Store className="w-5 h-5" />
            <span>Launch Sharma General Stores (Demo)</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
          <button
            onClick={onRegister}
            className="w-full sm:w-auto px-6 py-4 bg-white border border-slate-200 hover:border-paytm-blue text-slate-800 font-bold text-base rounded-2xl shadow-sm transition"
          >
            Register New Merchant
          </button>
        </div>

        {/* 5-Layer Architecture Showcase Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 text-left pt-6">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-paytm-blue flex items-center justify-center font-bold text-xs mb-3">L1</div>
            <h4 className="text-xs font-bold text-paytm-navy mb-1">Experience</h4>
            <p className="text-[11px] text-paytm-muted">Soundbox 4G, React web/mobile, & WhatsApp Business.</p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-cyan-50 text-paytm-cyan flex items-center justify-center font-bold text-xs mb-3">L2</div>
            <h4 className="text-xs font-bold text-paytm-navy mb-1">Voice & Indic</h4>
            <p className="text-[11px] text-paytm-muted">Sarvam Saaras STT & Bulbul TTS in Hindi & Marathi.</p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs mb-3">L3</div>
            <h4 className="text-xs font-bold text-paytm-navy mb-1">Agent Brain</h4>
            <p className="text-[11px] text-paytm-muted">LangGraph multi-agent orchestrator & scoped RAG.</p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs mb-3">L4</div>
            <h4 className="text-xs font-bold text-paytm-navy mb-1">Intelligence</h4>
            <p className="text-[11px] text-paytm-muted">LightGBM festive demand forecast & RFM uplift.</p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs mb-3">L5</div>
            <h4 className="text-xs font-bold text-paytm-navy mb-1">Action & Trust</h4>
            <p className="text-[11px] text-paytm-muted">7-state approval engine, DPDPA consent, SHA-256 logs.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
