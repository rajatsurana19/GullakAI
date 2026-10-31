import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, X, Send, Sparkles, CheckCircle2, AlertCircle, ArrowRight, Globe } from 'lucide-react';
import Waveform from '../common/Waveform';
import WhyExplanationCard from '../common/WhyExplanationCard';
import { apiClient } from '../../api/client';

export default function VoiceAssistantModal({ 
  isOpen, 
  onClose, 
  onNavigate, 
  currentLang = 'mr', 
  onLangChange,
  merchant 
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [processingState, setProcessingState] = useState('idle'); // idle, listening, processing, speaking, completed
  const [statusMessage, setStatusMessage] = useState('Tap the microphone to speak or pick a prompt below');
  const [queryText, setQueryText] = useState('');
  const [conversation, setConversation] = useState([]);
  const [interimText, setInterimText] = useState('');

  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const langLabels = {
    mr: 'मराठी',
    hi: 'हिन्दी',
    en: 'English'
  };

  const samplePromptsByLang = {
    mr: [
      { label: "आज ₹2,500 रोख विक्री", query: "आज ₹2,500 रोख विक्री झाली" },
      { label: "रमेशला ग्राहक जोडा", query: "रमेशला ग्राहक म्हणून जोडा" },
      { label: "६० दिवस न आलेले ग्राहक", query: "६० दिवसांत न आलेले ग्राहक दाखवा" },
      { label: "५० तूप मागवले तर खपेल का?", query: "५० पॅकेट तूप मागवले तर ग्राहकांना खपेल का?" },
      { label: "आजची विक्री", query: "आज माझी किती विक्री झाली?" },
      { label: "साठा तपासा", query: "माझा स्टॉक तपासा" },
      { label: "कमी साठा", query: "काय स्टॉक संपत आला आहे?" },
      { label: "कालची विक्री", query: "काल किती विक्री झाली?" },
      { label: "ऑर्डर तयार करा", query: "मला ऑर्डर तयार करून द्या" },
      { label: "विक्री अंदाज", query: "आगामी विक्रीचा अंदाज सांगा" }
    ],
    hi: [
      { label: "आज ₹2,500 कैश बिक्री", query: "आज ₹2,500 की नकद बिक्री हुई" },
      { label: "रमेश को ग्राहक जोड़ो", query: "रमेश को नया ग्राहक जोड़ो" },
      { label: "60 दिन से inactive ग्राहक", query: "60 दिन से जो ग्राहक नहीं आए उन्हें दिखाओ" },
      { label: "50 घी ऑर्डर करूं तो बिकेगा?", query: "अगर मैं 50 पैकेट घी आर्डर करूं तो क्या ग्राहकों को बिक जाएगा?" },
      { label: "आज की बिक्री", query: "Aaj ki sales kitni hui?" },
      { label: "स्टॉक चेक", query: "Mera stock check karo" },
      { label: "कम सामान", query: "Kaunse products khatam hone wale hain?" },
      { label: "कल की बिक्री", query: "Kal kitni sales hui?" },
      { label: "परचेज़ ऑर्डर", query: "Mujhe order prepare karke do" },
      { label: "सेल्स फोरकास्ट", query: "Mujhe sales forecast batao" }
    ],
    en: [
      { label: "Record Cash ₹2,500", query: "Record cash sale of ₹2,500 today" },
      { label: "Add Customer Ramesh", query: "Add Ramesh as a new customer" },
      { label: "60-Day Inactive Customers", query: "Show customers who have not visited in 60 days" },
      { label: "Will 50 Ghee Sell?", query: "If I order 50 packets of ghee, will my customers buy it?" },
      { label: "Today's Sales", query: "Show me today's sales summary." },
      { label: "Check Inventory", query: "Check my store inventory status." },
      { label: "Low Stock Alert", query: "Which products are running low?" },
      { label: "Yesterday's Sales", query: "How much sales did we make yesterday?" },
      { label: "Prepare Order", query: "Prepare a draft purchase order." },
      { label: "Working Capital", query: "Check my working capital loan eligibility." }
    ]
  };

  const currentPrompts = samplePromptsByLang[currentLang] || samplePromptsByLang.mr;

  const handleSendQuery = async (textToSend, audioBase64 = null) => {
    const text = textToSend !== undefined ? textToSend : queryText;
    if (!text.trim() && !audioBase64) return;

    if (text.trim()) {
      const userMsg = { id: Date.now(), sender: 'user', text, lang: currentLang };
      setConversation(prev => [...prev, userMsg]);
    }
    setQueryText('');
    setInterimText('');
    setProcessingState('processing');
    setStatusMessage('Gullak AI is analyzing your store records...');

    try {
      const payload = {
        text_query: text.trim() || undefined,
        language: currentLang,
        audio_base64: audioBase64 || undefined
      };

      const response = await apiClient.processVoice(payload);
      
      const agentMsg = {
        id: Date.now() + 1,
        sender: 'agent',
        text: response.response_text,
        agentName: response.agent_name,
        intent: response.intent,
        detectedLanguage: response.detected_language,
        whyExplanation: response.why_explanation,
        suggestedAction: response.suggested_action,
        approvalRequired: response.approval_required,
        approvalId: response.approval_id,
        audioBase64: response.audio_base64
      };

      setConversation(prev => [...prev, agentMsg]);
      setProcessingState(response.audio_base64 ? 'speaking' : 'completed');
      setStatusMessage(response.audio_base64 ? 'Speaking response...' : 'Response ready');

      if (response.audio_base64) {
        try {
          const audio = new Audio(`data:audio/wav;base64,${response.audio_base64}`);
          audio.onended = () => {
            setProcessingState('completed');
            setStatusMessage('Done. Tap mic to speak again.');
          };
          audio.play().catch(e => console.log('Audio autoplay prevented:', e));
        } catch (e) {
          console.log('Audio play error:', e);
        }
      } else {
        setTimeout(() => {
          setProcessingState('completed');
          setStatusMessage('Done. Tap mic to speak again.');
        }, 1000);
      }

    } catch (err) {
      setProcessingState('completed');
      setStatusMessage('Sorry, could not process request. Please try again.');
      setConversation(prev => [
        ...prev, 
        { 
          id: Date.now() + 1, 
          sender: 'agent', 
          text: err.message || "An error occurred. Please try again.",
          detectedLanguage: currentLang
        }
      ]);
    }
  };

  const startVoiceCapture = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = currentLang === 'mr' ? 'mr-IN' : (currentLang === 'hi' ? 'hi-IN' : 'en-IN');

      let transcriptFinal = '';

      recognition.onstart = () => {
        setIsRecording(true);
        setProcessingState('listening');
        setStatusMessage(`Listening in ${langLabels[currentLang]}... Speak now`);
      };

      recognition.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            transcriptFinal += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        setInterimText(interim || transcriptFinal);
        if (interim) {
          setStatusMessage(`Hearing: "${interim}"`);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
        setProcessingState('completed');
        if (event.error === 'no-speech') {
          setStatusMessage('No speech detected. Please tap mic and speak again.');
        } else if (event.error === 'not-allowed') {
          setStatusMessage('Microphone access denied. Please grant permission in browser settings.');
        } else {
          setStatusMessage(`Recognition error (${event.error}). Please try again.`);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
        const spoken = (transcriptFinal || interimText).trim();
        if (spoken) {
          handleSendQuery(spoken);
        } else {
          setProcessingState('completed');
          setStatusMessage('No speech detected. Tap mic to speak again.');
        }
      };

      try {
        recognition.start();
      } catch (e) {
        console.error('Failed to start recognition:', e);
        setIsRecording(false);
        setProcessingState('completed');
        setStatusMessage('Could not start microphone.');
      }
    } else {
      // Fallback MediaRecorder
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
          setIsRecording(true);
          setProcessingState('listening');
          setStatusMessage(`Recording in ${langLabels[currentLang]}... Tap stop when done.`);
          audioChunksRef.current = [];
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;

          mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) audioChunksRef.current.push(e.data);
          };

          mediaRecorder.onstop = () => {
            stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
            if (audioBlob.size > 500) {
              const reader = new FileReader();
              reader.readAsDataURL(audioBlob);
              reader.onloadend = () => {
                const base64Audio = reader.result.split(',')[1];
                handleSendQuery('', base64Audio);
              };
            } else {
              setProcessingState('completed');
              setStatusMessage('No audio captured. Tap mic to try again.');
            }
          };

          mediaRecorder.start();
        }).catch((err) => {
          console.error('Audio permission error:', err);
          setProcessingState('completed');
          setStatusMessage('Microphone access denied.');
        });
      } else {
        setStatusMessage('Voice recognition is not supported in this browser. Please use text input.');
      }
    }
  };

  const stopVoiceCapture = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore stop error
      }
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        // Ignore stop error
      }
    }
    setIsRecording(false);
  };

  const toggleMic = () => {
    if (isRecording) {
      stopVoiceCapture();
    } else {
      startVoiceCapture();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-100">
        
        {/* Header with Language Selector - Solid Paytm FinTech */}
        <div className="px-5 py-3.5 border-b border-[#E5E7EB] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#002970]/10 text-[#002970] flex items-center justify-center font-bold text-sm">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#002970]">
                {currentLang === 'mr' ? 'गुल्लक व्हॉइस असिस्टंट (Ask Gullak)' : currentLang === 'hi' ? 'गुल्लक वॉइस असिस्टेंट (Ask Gullak)' : 'Ask Gullak Voice Assistant'}
              </h3>
              <p className="text-[11px] text-[#6B7280]">
                {currentLang === 'mr' ? 'मराठी, हिन्दी व इंग्रजी बहुभाषिक सहाय्य' : currentLang === 'hi' ? 'मराठी, हिन्दी व अंग्रेजी बहुभाषी सहायता' : 'Multilingual Kirana Co-pilot'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher in Modal Header */}
            <div className="flex items-center bg-[#F5F7FA] p-0.5 rounded-lg border border-[#E5E7EB] text-xs font-semibold">
              {['mr', 'hi', 'en'].map((code) => (
                <button
                  key={code}
                  onClick={() => onLangChange && onLangChange(code)}
                  className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                    currentLang === code
                      ? 'bg-white text-[#002970] shadow-xs'
                      : 'text-[#6B7280] hover:text-[#1A1A1A]'
                  }`}
                >
                  {langLabels[code]}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#F5F7FA] rounded-lg transition"
              aria-label="Close voice assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Conversation Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 min-h-[240px]">
          {conversation.length === 0 ? (
            <div className="py-6 text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-paytm-cyan/10 text-paytm-blue flex items-center justify-center animate-voice-pulse">
                <Mic className="w-8 h-8 text-paytm-blue" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm sm:text-base">
                Speak or type in {langLabels[currentLang]}
              </h4>
              <p className="text-xs text-paytm-muted max-w-sm mx-auto mt-1 mb-5">
                Ask about today's sales, stock levels, draft purchase orders, or customer insights.
              </p>

              {/* Sample Prompts */}
              <div className="text-left max-w-md mx-auto">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Sample Voice Prompts ({langLabels[currentLang]}):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendQuery(p.query)}
                      className="text-left p-2.5 bg-white hover:bg-blue-50/50 border border-slate-200/80 hover:border-paytm-cyan rounded-xl transition text-xs font-medium text-slate-700 active:scale-98 shadow-xs"
                    >
                      <span className="font-bold text-paytm-blue block text-[11px]">{p.label}</span>
                      <span className="truncate block text-slate-600 mt-0.5">"{p.query}"</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            conversation.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-paytm-blue text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                  }`}
                >
                  {msg.agentName && (
                    <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                      <span className="text-[10px] font-extrabold uppercase tracking-wide text-paytm-blue bg-blue-50 px-2 py-0.5 rounded-md">
                        {msg.agentName}
                      </span>
                      {msg.detectedLanguage && (
                        <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md">
                          {msg.detectedLanguage.toUpperCase()}
                        </span>
                      )}
                      {msg.intent && (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                          {msg.intent}
                        </span>
                      )}
                    </div>
                  )}
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                </div>

                {/* AI Explanation Card */}
                {msg.whyExplanation && (
                  <div className="w-full max-w-[90%] mt-1">
                    <WhyExplanationCard
                      explanation={msg.whyExplanation}
                      suggestedAction={msg.suggestedAction}
                      dataSources={["Store Transactions", "Festive Forecast Model", "Current Stock"]}
                      lang={currentLang}
                    />
                  </div>
                )}

                {/* Direct Action Approval Link */}
                {msg.approvalRequired && (
                  <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-2xl w-full max-w-[90%] flex items-center justify-between gap-2 shadow-xs">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span className="text-xs font-semibold text-amber-900">Merchant Approval Required</span>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        onNavigate('approvals');
                      }}
                      className="px-3 py-1.5 bg-amber-600 text-white font-bold text-xs rounded-xl hover:bg-amber-700 transition flex items-center gap-1"
                    >
                      <span>Review in Approvals</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Live Audio Visualizer & State */}
        <div className="px-4 py-2 border-t border-slate-100 bg-white">
          <Waveform active={isRecording || processingState === 'speaking'} />
          <div className="text-center text-xs font-medium text-paytm-navy mt-1.5">
            {interimText ? `"${interimText}"` : statusMessage}
          </div>
        </div>

        {/* Input Bar & Controls */}
        <div className="p-3 border-t border-slate-100 bg-white flex items-center gap-2">
          <button
            onClick={toggleMic}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md active:scale-95 transition-all flex-shrink-0 ${
              isRecording
                ? 'bg-paytm-danger animate-pulse ring-4 ring-rose-200'
                : 'bg-gradient-to-tr from-paytm-cyan to-paytm-blue hover:shadow-lg'
            }`}
            aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
          >
            {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          <input
            type="text"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendQuery()}
            placeholder={
              currentLang === 'mr'
                ? "मराठीत विचारा (उदा. 'आज किती विक्री झाली?')"
                : (currentLang === 'hi' ? "हिन्दी में पूछें (जैसे 'आज की बिक्री कितनी हुई?')" : "Ask in English (e.g. 'Show today's sales')")
            }
            className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-paytm-cyan focus:bg-white transition"
          />

          <button
            onClick={() => handleSendQuery()}
            disabled={!queryText.trim()}
            className="w-10 h-10 rounded-xl bg-paytm-blue text-white flex items-center justify-center hover:bg-blue-600 disabled:opacity-40 disabled:hover:bg-paytm-blue transition active:scale-95 flex-shrink-0 shadow-xs"
            aria-label="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
