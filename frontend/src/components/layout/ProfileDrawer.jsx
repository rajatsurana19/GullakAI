import React, { useState } from 'react';
import { 
  X, 
  Store, 
  ShieldCheck, 
  Sliders, 
  RotateCcw, 
  FileCode, 
  LogOut, 
  Check, 
  AlertCircle,
  Sparkles,
  Phone,
  MapPin,
  Building2,
  Lock
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { translations } from '../../i18n/translations';

export default function ProfileDrawer({ 
  isOpen, 
  onClose, 
  merchant, 
  onLogout, 
  onNavigate,
  currentLang = 'mr' 
}) {
  const [resetState, setResetState] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState(null);
  const [consents, setConsents] = useState({
    voice_soundbox: true,
    whatsapp_brief: true,
    hyperlocal_signals: true,
    data_learning: true
  });

  const t = translations[currentLang] || translations.mr;

  if (!isOpen) return null;

  const handleToggleConsent = (key) => {
    setConsents(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleResetDemo = async (state) => {
    setResetting(true);
    setResetState(state);
    setResetMessage(null);
    try {
      const res = await apiClient.resetDemo(state);
      setResetMessage({ type: 'success', text: res.message || `Demo state switched to ${state}!` });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      setResetMessage({ type: 'error', text: err.message || 'Failed to reset demo state.' });
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div 
        className="absolute inset-y-0 right-0 max-w-full flex pl-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full border-l border-slate-200">
          
          {/* Drawer Header */}
          <div className="p-5 bg-gradient-to-r from-paytm-navy to-paytm-blue text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center font-black text-paytm-cyan text-lg border border-white/20">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-base leading-tight">
                  {merchant?.business_name || 'Sharma General Store'}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-slate-300">
                    {merchant?.category ? merchant.category.toUpperCase() : 'KIRANA & PROVISION'}
                  </span>
                  <span className="text-[10px] bg-paytm-cyan/20 text-paytm-cyan font-bold px-1.5 py-0.2 rounded">
                    Paytm Merchant
                  </span>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 text-sm">
            
            {/* Merchant Details Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                {currentLang === 'mr' ? 'दुकानदार तपशील' : currentLang === 'hi' ? 'व्यापारी विवरण' : 'Merchant Details'}
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1.5"><Store className="w-3.5 h-3.5" /> Merchant ID:</span>
                <span className="font-mono font-bold text-slate-800">{merchant?.id || 'M-SHARMA-001'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Mobile:</span>
                <span className="font-medium text-slate-800">{merchant?.phone || '+91 98200 12345'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Location:</span>
                <span className="font-medium text-slate-800">{merchant?.city || 'Dadar, Mumbai'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> Business Archetype:</span>
                <span className="font-bold text-paytm-blue bg-paytm-blue/10 px-2 py-0.5 rounded-full text-[11px]">
                  Kirana (Grocery & FMCG)
                </span>
              </div>
            </div>

            {/* DPDPA 2023 Consent & Privacy Controls */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-xs uppercase tracking-wide text-slate-700">
                    {currentLang === 'mr' ? 'गोपनीयता व संमती (DPDPA 2023)' : 'DPDPA 2023 Consent Controls'}
                  </span>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  Compliant
                </span>
              </div>

              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 space-y-3">
                <label className="flex items-start justify-between gap-3 cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      {currentLang === 'mr' ? 'साउंडबॉक्स दैनिक घोषणा' : 'Soundbox Morning Partner Brief'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {currentLang === 'mr' ? 'सकाळी आवाजात विक्री व महत्त्वाच्या सूचना ऐकवा' : 'Announce sales and stock alerts on 4G device'}
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={consents.voice_soundbox}
                    onChange={() => handleToggleConsent('voice_soundbox')}
                    className="w-4 h-4 text-paytm-blue rounded mt-0.5 focus:ring-paytm-cyan"
                  />
                </label>

                <label className="flex items-start justify-between gap-3 cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      {currentLang === 'mr' ? 'व्हॉट्सॲप व्यवसाय संदेश' : 'WhatsApp Business Summaries'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {currentLang === 'mr' ? 'दैनिक अहवाल व सणांचे अलर्ट पाठवा' : 'Deliver daily brief & festive notifications'}
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={consents.whatsapp_brief}
                    onChange={() => handleToggleConsent('whatsapp_brief')}
                    className="w-4 h-4 text-paytm-blue rounded mt-0.5 focus:ring-paytm-cyan"
                  />
                </label>

                <label className="flex items-start justify-between gap-3 cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      {currentLang === 'mr' ? 'हायपरलोकल सण व हवामान विश्लेषण' : 'Hyperlocal Festive & Weather Signals'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {currentLang === 'mr' ? 'परिसरातील मागणी व सण वाढीचा अंदाज वापरा' : 'Use local neighborhood signals for demand boost'}
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={consents.hyperlocal_signals}
                    onChange={() => handleToggleConsent('hyperlocal_signals')}
                    className="w-4 h-4 text-paytm-blue rounded mt-0.5 focus:ring-paytm-cyan"
                  />
                </label>

                <label className="flex items-start justify-between gap-3 cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      {currentLang === 'mr' ? 'अनामिक शिक्षण व मॉडेल सुधारणा' : 'Anonymized Learning & Ranking'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {currentLang === 'mr' ? 'सफल निर्णयांच्या आधारे भविष्य सुधारणे' : 'Improve recommendation rankings from causal results'}
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={consents.data_learning}
                    onChange={() => handleToggleConsent('data_learning')}
                    className="w-4 h-4 text-paytm-blue rounded mt-0.5 focus:ring-paytm-cyan"
                  />
                </label>
              </div>
            </div>

            {/* Hero Story Demo State Switcher */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-paytm-blue" />
                <span className="font-bold text-xs uppercase tracking-wide text-slate-700">
                  {currentLang === 'mr' ? 'डेमो अवस्था बदला (Hero Story)' : 'Hero Story Demo State Switcher'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Switch between the 3 timeline phases of our Diwali hero story:
              </p>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleResetDemo('before')}
                  disabled={resetting}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    resetState === 'before'
                      ? 'border-amber-400 bg-amber-50 font-bold'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-extrabold text-amber-900">1. Before</div>
                  <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                    Ghee stockout warning, 60 lapsed users
                  </div>
                </button>

                <button
                  onClick={() => handleResetDemo('mid')}
                  disabled={resetting}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    resetState === 'mid'
                      ? 'border-paytm-blue bg-blue-50 font-bold'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-extrabold text-paytm-blue">2. Mid</div>
                  <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                    ONDC order & WhatsApp draft ready
                  </div>
                </button>

                <button
                  onClick={() => handleResetDemo('after')}
                  disabled={resetting}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    resetState === 'after'
                      ? 'border-emerald-400 bg-emerald-50 font-bold'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-extrabold text-emerald-900">3. After</div>
                  <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                    Actions executed & ₹ extra measured
                  </div>
                </button>
              </div>

              {resetMessage && (
                <div className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1.5 ${
                  resetMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                }`}>
                  {resetMessage.type === 'success' ? <Check className="w-3.5 h-3.5 flex-shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />}
                  <span>{resetMessage.text}</span>
                </div>
              )}
            </div>

            {/* Developer Appendix Link */}
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  onClose();
                  onNavigate('appendix');
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition"
              >
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-paytm-blue" />
                  <span>{t.devAppendix || 'तांत्रिक तपशील (Dev Appendix & Models)'}</span>
                </div>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                  WAPE / Uplift
                </span>
              </button>
            </div>

          </div>

          {/* Drawer Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Gullak AI v2.0 Enterprise</span>
            </div>
            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-xs transition"
            >
              <LogOut className="w-4 h-4" />
              <span>{currentLang === 'mr' ? 'लॉग आउट' : 'Log Out'}</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
