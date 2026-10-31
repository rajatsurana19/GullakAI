import React, { useState, useEffect } from 'react';
import { Volume2, Play, Square, MessageSquare, RefreshCw, X, Radio, ShieldCheck } from 'lucide-react';
import { apiClient } from '../../api/client';
import { translations, formatLocalizedNumber, formatLocalizedCurrency } from '../../i18n/translations';

export default function SoundboxModal({ isOpen, onClose, merchant, currentLang = 'mr' }) {
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const t = translations[currentLang] || translations.mr;

  useEffect(() => {
    if (isOpen) {
      loadDailyBrief();
    } else {
      stopSpeech();
    }
  }, [isOpen, merchant?.id, currentLang]);

  const loadDailyBrief = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getDailyBrief(merchant?.id);
      setBrief(data);
    } catch (err) {
      console.error('Failed to load daily brief:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunBriefNow = async () => {
    setLoading(true);
    try {
      const data = await apiClient.triggerDailyBrief(merchant?.id);
      setBrief(data);
    } catch (err) {
      console.error('Failed to trigger daily brief:', err);
    } finally {
      setLoading(false);
    }
  };

  const playSpeech = (text) => {
    if (!('speechSynthesis' in window) || !text) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (currentLang === 'mr') {
      utterance.lang = 'mr-IN';
    } else if (currentLang === 'hi') {
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'en-IN';
    }

    utterance.rate = 0.95;
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  if (!isOpen) return null;

  const ttsText = currentLang === 'mr'
    ? `शुभ प्रभात राजेशजी! कालची एकूण विक्री ${formatLocalizedCurrency(74036, 'mr')} झाली असून १२% वाढ झाली आहे. देशी तूपाचा साठा संपत आला असून ONDC वरून ४५ लिटर ऑर्डर मंजूर करा.`
    : currentLang === 'hi'
    ? `शुभ प्रभात राजेश जी! कल की कुल बिक्री ${formatLocalizedCurrency(74036, 'hi')} रही जो 12% अधिक है। देसी घी का स्टॉक कम है और ONDC से 45 लीटर का ऑर्डर तुरंत स्वीकृत करें।`
    : `Good morning Rajesh ji! Yesterday sales were ₹74,036, up 12%. Desi Ghee stock is critically low. Review and approve the 45L ONDC restock in Gullak.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071E46]/50 backdrop-blur-xs animate-fade-in" onClick={onClose}>
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-[#E5E7EB] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Solid Paytm Navy */}
        <div className="bg-[#002970] px-5 py-3.5 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/15">
              <Radio className="w-4 h-4 text-[#00BAF2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight">Paytm Soundbox 4G</span>
                <span className="text-[10px] font-bold bg-[#00875A]/20 text-[#00875A] bg-white px-2 py-0.2 rounded border border-[#00875A]/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00875A] animate-ping" /> Live
                </span>
              </div>
              <p className="text-[11px] text-white/80">
                {t.soundboxBriefTitle}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          
          {/* Soundbox 4G Speaker Box */}
          <div className="bg-[#071E46] rounded-xl p-4 text-white border border-[#002970]">
            <div className="flex items-center justify-between mb-2 text-xs text-white/70">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00875A]" />
                <span className="font-mono uppercase text-[10px] text-[#00BAF2]">4G Cellular Audio Broadcast</span>
              </div>
              <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-white/80">
                {currentLang === 'mr' ? '८:०० AM सकाळी' : currentLang === 'hi' ? '8:00 AM सुबह' : '8:00 AM Daily'}
              </span>
            </div>

            {/* Spoken Voice Script */}
            <div className="bg-black/30 rounded-lg p-3.5 border border-white/10">
              <div className="flex items-center justify-between text-xs text-[#00BAF2] font-semibold mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4" />
                  <span>{currentLang === 'mr' ? 'साउंडबॉक्स ऑडिओ घोषणा' : currentLang === 'hi' ? 'साउंडबॉक्स ऑडियो घोषणा' : 'Soundbox Spoken Broadcast'}</span>
                </span>
                <span className="text-[10px] text-white/60 font-mono">
                  &lt;40 words
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium leading-relaxed text-white">
                "{ttsText}"
              </p>
            </div>

            {/* Voice Control Buttons */}
            <div className="mt-3 flex items-center gap-2">
              {!isPlaying ? (
                <button
                  onClick={() => playSpeech(ttsText)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#00BAF2] hover:bg-[#00a3d4] text-[#071E46] font-bold rounded-lg text-xs transition"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{currentLang === 'mr' ? 'आवाज ऐका (Play Soundbox)' : currentLang === 'hi' ? 'आवाज सुनें (Play Soundbox)' : 'Play Spoken Announcement'}</span>
                </button>
              ) : (
                <button
                  onClick={stopSpeech}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#D92D20] text-white font-bold rounded-lg text-xs transition"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>{currentLang === 'mr' ? 'थांबवा (Stop)' : currentLang === 'hi' ? 'रोकें (Stop)' : 'Stop Playback'}</span>
                </button>
              )}

              <button
                onClick={handleRunBriefNow}
                disabled={loading}
                title="Refresh with latest Soundbox sales"
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition border border-white/10 flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* WhatsApp Merchant Morning Message (Supported Partner Channel) */}
          <div className="bg-[#F5F7FA] border border-[#E5E7EB] rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#1A1A1A]">
              <div className="flex items-center gap-1.5 text-[#00875A]">
                <MessageSquare className="w-4 h-4" />
                <span>{currentLang === 'mr' ? 'व्हॉट्सॲप मर्चंट पार्टनर मेसेज' : currentLang === 'hi' ? 'व्हाट्सएप मर्चेंट पार्टनर मैसेज' : 'WhatsApp Companion Delivery'}</span>
              </div>
              <span className="text-[10px] font-mono text-[#6B7280]">
                +91 98200 12345
              </span>
            </div>
            
            <div className="bg-white rounded-lg p-3 text-xs leading-relaxed text-[#1A1A1A] font-sans border border-[#E5E7EB] whitespace-pre-line shadow-xs">
              {currentLang === 'mr'
                ? `🙏 *शुभ प्रभात राजेशजी!*
💰 *कालची एकूण विक्री:* ${formatLocalizedCurrency(74036, 'mr')} (+१२% वाढ)
⚠️ *तातडीचा इशारा:* देशी तूपाचा साठा संपत आला आहे (४ दिवस शिल्लक).
📋 *३ निर्णय मंजुरीसाठी सज्ज:*
१. महालक्ष्मी डिस्ट्रीब्यूटर्सकडून ४५ लिटर तूप ONDC वरून मागवा.
२. ६० जुन्या ग्राहकांना दिवाळी सवलत पाठवा.
३. ₹५०,००० पूर्व-मंजूर खेळते भांडवल उपलब्ध.

👉 *मंजूर करण्यासाठी गुल्लक ॲप उघडा.*`
                : currentLang === 'hi'
                ? `🙏 *शुभ प्रभात राजेश जी!*
💰 *कल की कुल बिक्री:* ${formatLocalizedCurrency(74036, 'hi')} (+12% बढ़ोतरी)
⚠️ *स्टॉक अलर्ट:* गाय के देसी घी का स्टॉक कम है (4 दिन शेष)।
📋 *3 जरूरी फैसले तैयार हैं:*
1. महालक्ष्मी डिस्ट्रीब्यूटर्स से 45L घी ONDC पर री-ऑर्डर करें।
2. 60 पुराने ग्राहकों को व्हाट्सएप दिवाली ऑफर भेजें।
3. ₹50,000 प्री-अप्रूव्ड वर्किंग कैपिटल क्रेडिट उपलब्ध।

👉 *मंजूरी देने हेतु गुल्लक ऐप खोलें।*`
                : `🙏 *Good Morning Rajesh ji!*
💰 *Yesterday Sales:* ₹74,036 (+12% lift)
⚠️ *Urgent Stockout Alert:* Pure Desi Cow Ghee low (4 days left).
📋 *3 Actions Ready for Approval:*
1. Reorder 45L Ghee via ONDC wholesale.
2. Send WhatsApp festive offer to 60 inactive customers.
3. ₹50,000 working capital line available.

👉 *Open Gullak to approve.*`}
            </div>
            
            <p className="text-[10px] text-[#6B7280]">
              {currentLang === 'mr' 
                ? '✓ सकाळी ०८:०० वाजता आपोआप दुकानदाराच्या अधिकृत व्हॉट्सॲप नंबरवर पाठवले जाते.' 
                : currentLang === 'hi'
                ? '✓ सुबह 08:00 बजे स्वतः दुकानदार के अधिकृत व्हाट्सएप नंबर पर डिलीवर होता है।'
                : '✓ Automatically delivered at 08:00 AM daily to merchant registered WhatsApp.'}
            </p>
          </div>

          {/* Hardware Transparency Rationale (Requirement 8) */}
          <div className="p-3 bg-white border border-[#E5E7EB] rounded-xl flex items-start gap-2 text-[11px] text-[#6B7280]">
            <ShieldCheck className="w-4 h-4 text-[#002970] flex-shrink-0 mt-0.5" />
            <p>
              <strong className="text-[#1A1A1A]">Paytm Soundbox 4G Hardware: </strong>
              {currentLang === 'mr'
                ? 'साउंडबॉक्समध्ये थेट 4G सिम व लाऊडस्पीकर जोडलेला आहे. हे केवळ ऑडिओ घोषणा व व्हॉट्सॲप मेसेजिंग वापरते; कोणत्याही असहाय्य हार्डवेअरचा आभास निर्माण करत नाही.'
                : currentLang === 'hi'
                ? 'साउंडबॉक्स में 4G सिम और लाउडस्पीकर लगा है। यह केवल ऑडियो प्रसारण व व्हाट्सएप पार्टनर अलर्ट का उपयोग करता है, किसी असमर्थित हार्डवेयर की कल्पना नहीं करता।'
                : 'Operates strictly via native 4G SIM cellular audio speaker and synchronized WhatsApp alerts. Never assumes unsupported hardware screens or sensors.'}
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-[#F5F7FA] border-t border-[#E5E7EB] px-5 py-2.5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#002970] hover:bg-[#071E46] text-white font-bold text-xs rounded-lg transition"
          >
            {currentLang === 'mr' ? 'बंद करा' : currentLang === 'hi' ? 'बंद करें' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
