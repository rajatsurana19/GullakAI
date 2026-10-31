import React, { useState } from 'react';
import { CheckCircle2, Store, Mic, ShieldCheck, ArrowRight } from 'lucide-react';

export default function OnboardingPage({ merchant, onComplete }) {
  const [step, setStep] = useState(1);
  const [soundboxPaired, setSoundboxPaired] = useState(true);
  const [selectedLang, setSelectedLang] = useState('mr');

  return (
    <div className="min-h-screen bg-paytm-bg flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-8">
        
        {/* Progress bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 1 ? 'bg-paytm-blue text-white' : 'bg-slate-100 text-slate-400'
            }`}>1</span>
            <span className="text-xs font-bold text-paytm-navy">Store Profile</span>
          </div>
          <div className="w-12 h-0.5 bg-slate-200" />
          <div className="flex items-center gap-2">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 2 ? 'bg-paytm-blue text-white' : 'bg-slate-100 text-slate-400'
            }`}>2</span>
            <span className="text-xs font-bold text-paytm-navy">Soundbox 4G</span>
          </div>
          <div className="w-12 h-0.5 bg-slate-200" />
          <div className="flex items-center gap-2">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 3 ? 'bg-paytm-blue text-white' : 'bg-slate-100 text-slate-400'
            }`}>3</span>
            <span className="text-xs font-bold text-paytm-navy">Voice & Language</span>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-xl font-black text-paytm-navy">Confirm Your Store Details</h3>
            <p className="text-xs text-paytm-muted">Review your verified business location and UPI settlement details.</p>
            <div className="p-4 bg-slate-50 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Business Name</span>
                <span className="font-bold text-slate-800">{merchant?.business_name || 'Sharma General Stores'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Category</span>
                <span className="font-bold text-slate-800">Grocery & General Store</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Paytm Settlement VPA</span>
                <span className="font-bold text-paytm-blue">sharma.stores@paytm</span>
              </div>
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full py-3 bg-paytm-blue text-white font-bold text-sm rounded-xl hover:bg-blue-600 transition flex items-center justify-center gap-2"
            >
              <span>Continue to Soundbox Pairing</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-xl font-black text-paytm-navy">Paytm Soundbox 4G Integration</h3>
            <p className="text-xs text-paytm-muted">Gullak AI automatically pairs with your Paytm Soundbox 4G device to announce audio sales.</p>
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-900">Device SB-MUM-4G-9820 Paired</h4>
                <p className="text-[11px] text-emerald-700">Battery: 88% • Signal: 4G LTE • Firmware: v4.2.1</p>
              </div>
            </div>
            <button
              onClick={() => setStep(3)}
              className="w-full py-3 bg-paytm-blue text-white font-bold text-sm rounded-xl hover:bg-blue-600 transition flex items-center justify-center gap-2"
            >
              <span>Continue to Voice Settings</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-xl font-black text-paytm-navy">Select Voice Language</h3>
            <p className="text-xs text-paytm-muted">Select your primary spoken language for Sarvam Saaras STT and Bulbul voice responses.</p>
            
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSelectedLang('mr')}
                className={`p-3.5 rounded-2xl border text-center transition ${
                  selectedLang === 'mr' ? 'border-paytm-cyan bg-cyan-50/50 text-paytm-blue font-bold shadow-xs' : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                <span className="text-base block mb-0.5">मराठी</span>
                <span className="text-[10px] text-slate-500">Marathi</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedLang('hi')}
                className={`p-3.5 rounded-2xl border text-center transition ${
                  selectedLang === 'hi' ? 'border-paytm-cyan bg-cyan-50/50 text-paytm-blue font-bold shadow-xs' : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                <span className="text-base block mb-0.5">हिन्दी</span>
                <span className="text-[10px] text-slate-500">Hindi</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedLang('en')}
                className={`p-3.5 rounded-2xl border text-center transition ${
                  selectedLang === 'en' ? 'border-paytm-cyan bg-cyan-50/50 text-paytm-blue font-bold shadow-xs' : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                <span className="text-base block mb-0.5">English</span>
                <span className="text-[10px] text-slate-500">Indian English</span>
              </button>
            </div>

            <button
              onClick={onComplete}
              className="w-full py-3 bg-gradient-to-r from-paytm-cyan to-paytm-blue text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Launch Store Dashboard</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
