import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, Send, ArrowRight, Globe, CheckCircle2, AlertCircle } from 'lucide-react';
import Waveform from '../components/common/Waveform';
import WhyExplanationCard from '../components/common/WhyExplanationCard';
import { apiClient } from '../api/client';

export default function VoiceAssistantPage({ onNavigate, currentLang = 'mr', onLangChange, merchant }) {
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState('Tap microphone to speak or type a business question');
  const [inputText, setInputText] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');

  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Language display mapping
  const langLabels = {
    mr: 'मराठी',
    hi: 'हिन्दी',
    en: 'English'
  };

  // Dynamic sample prompts based on selected language
  const presetsByLang = {
    mr: [
      { label: "आज ₹2,500 रोख विक्री नोंदवा", query: "आज ₹2,500 रोख विक्री झाली" },
      { label: "६० दिवस न आलेले ग्राहक दाखवा", query: "६० दिवसांत न आलेले ग्राहक दाखवा" },
      { label: "५० तूप मागवले तर खपेल का?", query: "५० पॅकेट तूप मागवले तर ग्राहकांना खपेल का?" },
      { label: "आजची एकूण विक्री व शिल्लक", query: "आज माझी किती विक्री झाली?" },
      { label: "कमी साठा इशारा", query: "काय साठा संपत आला आहे?" },
      { label: "उद्या बँकेत किती जमा होतील?", query: "उद्या सकाळी बँकेत किती पैसे जमा होतील?" }
    ],
    hi: [
      { label: "आज ₹2,500 कैश बिक्री दर्ज करें", query: "आज ₹2,500 की नकद बिक्री हुई" },
      { label: "60 दिन से inactive ग्राहक", query: "60 दिन से जो ग्राहक नहीं आए उन्हें दिखाओ" },
      { label: "50 घी ऑर्डर करूं तो बिकेगा?", query: "अगर मैं 50 पैकेट घी आर्डर करूं तो क्या ग्राहकों को बिक जाएगा?" },
      { label: "आज की कुल बिक्री और जमा", query: "आज की बिक्री कितनी हुई?" },
      { label: "कम स्टॉक वाले प्रोडक्ट्स", query: "कौनसे प्रोडक्ट्स खत्म होने वाले हैं?" },
      { label: "कल सुबह बैंक ट्रांसफर कितना है?", query: "कल सुबह बैंक में कितने पैसे ट्रांसफर होंगे?" }
    ],
    en: [
      { label: "Record Cash ₹2,500", query: "Record cash sale of ₹2,500 today" },
      { label: "60-Day Inactive Customers", query: "Show customers who have not visited in 60 days" },
      { label: "Will 50 Ghee Sell?", query: "If I order 50 packets of ghee, will my customers buy it?" },
      { label: "Today's Sales & Settlement", query: "Show me today's sales and pending settlement." },
      { label: "Low-Stock Depletion Alert", query: "Which products are running low on stock?" },
      { label: "Working Capital Estimate", query: "How much working capital credit can I get?" }
    ]
  };

  const currentPresets = presetsByLang[currentLang] || presetsByLang.mr;

  const handleQuery = async (queryToSend, audioBase64 = null) => {
    const q = queryToSend !== undefined ? queryToSend : inputText;
    if (!q.trim() && !audioBase64) {
      setStatus('Please enter or speak a question.');
      return;
    }

    if (q.trim()) {
      setHistory(prev => [...prev, { id: Date.now(), sender: 'user', text: q, lang: currentLang }]);
    }
    setInputText('');
    setInterimTranscript('');
    setLoading(true);
    setStatus('Analyzing Paytm store data...');

    try {
      const payload = {
        text_query: q.trim() || undefined,
        language: currentLang,
        audio_base64: audioBase64 || undefined
      };

      const res = await apiClient.processVoice(payload);
      
      const agentMsg = {
        id: Date.now() + 1,
        sender: 'agent',
        text: res.response_text,
        agentName: res.agent_name,
        intent: res.intent,
        detectedLanguage: res.detected_language,
        whyExplanation: res.why_explanation,
        suggestedAction: res.suggested_action,
        approvalRequired: res.approval_required,
        approvalId: res.approval_id,
        audioBase64: res.audio_base64
      };
      
      setHistory(prev => [...prev, agentMsg]);
      setStatus(res.audio_base64 ? 'Speaking response...' : 'Ready');

      if (res.audio_base64) {
        try {
          const audio = new Audio(`data:audio/wav;base64,${res.audio_base64}`);
          audio.onended = () => setStatus('Ready');
          audio.play().catch(e => console.log('Autoplay error:', e));
        } catch (e) {
          console.log('Audio playback error:', e);
        }
      }
    } catch (err) {
      setHistory(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'agent',
          text: currentLang === 'mr' 
            ? 'माहिती मिळवताना तांत्रिक अडचण आली. कृपया पुन्हा प्रयत्न करा.' 
            : (currentLang === 'hi' ? 'डेटा प्रोसेस करने में समस्या हुई। कृपया पुनः प्रयास करें।' : 'Unable to process query. Please retry.'),
          isError: true
        }
      ]);
      setStatus('Error occurred. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = currentLang === 'mr' ? 'mr-IN' : (currentLang === 'hi' ? 'hi-IN' : 'en-IN');

        recognition.onstart = () => {
          setIsRecording(true);
          setStatus(`Listening in ${langLabels[currentLang]}... Speak clearly into microphone`);
        };

        recognition.onresult = (event) => {
          let interim = '';
          let final = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              final += event.results[i][0].transcript;
            } else {
              interim += event.results[i][0].transcript;
            }
          }
          if (interim) setInterimTranscript(interim);
          if (final) {
            setIsRecording(false);
            handleQuery(final);
          }
        };

        recognition.onerror = (event) => {
          console.log('SpeechRecognition error:', event.error);
          setIsRecording(false);
          setStatus('Speech error. You can type your question.');
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognition.start();
      } catch (e) {
        setIsRecording(false);
        setStatus('Microphone unavailable.');
      }
    } else {
      // Fallback to MediaRecorder audio capture
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
          setIsRecording(true);
          setStatus(`Recording audio in ${langLabels[currentLang]}... Tap stop when finished.`);
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
                handleQuery('', base64Audio);
              };
            } else {
              setStatus('No audio recorded. Tap mic to try again.');
            }
          };

          mediaRecorder.start();
        }).catch((err) => {
          console.error('MediaDevices error:', err);
          setStatus('Microphone permission required. Please enable microphone.');
        });
      } else {
        setStatus('Microphone is not supported in this browser. Please use text input.');
      }
    }
  };

  const stopListening = () => {
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
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-16 font-sans text-[#1A1A1A]">
      
      {/* 1. Clean Header & Language Switcher */}
      <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#071E46]">
            {currentLang === 'mr' ? 'विचारा — गुल्लक व्यवसाय सहाय्यक' : (currentLang === 'hi' ? 'पूछें — गुल्लक बिज़नेस सहायक' : 'Ask Gullak — Business Assistant')}
          </h2>
          <p className="text-xs text-[#6B7280]">
            {currentLang === 'mr' ? 'दुकान विक्री, साठा, ग्राहक व बँक जमा माहिती' : 'Instant store queries, sales reports, inventory alerts & deposits'}
          </p>
        </div>

        {/* Selected Language Indicator & Switcher */}
        <div className="flex items-center gap-1 bg-[#F5F7FA] p-0.5 rounded-lg border border-[#E5E7EB] text-xs">
          {['mr', 'hi', 'en'].map((code) => (
            <button
              key={code}
              onClick={() => onLangChange && onLangChange(code)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                currentLang === code
                  ? 'bg-white text-[#002970] shadow-xs font-bold'
                  : 'text-[#6B7280] hover:text-[#1A1A1A]'
              }`}
            >
              {code === 'mr' ? 'मराठी' : (code === 'hi' ? 'हिन्दी' : 'English')}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Main Conversation Hub */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] flex flex-col h-[540px] overflow-hidden">
        
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-[#F5F7FA]/50">
          {history.length === 0 ? (
            <div className="py-4 text-center max-w-lg mx-auto">
              <h3 className="text-sm font-bold text-[#071E46]">
                {currentLang === 'mr' ? 'कोणताही व्यावसायिक प्रश्न विचारा' : (currentLang === 'hi' ? 'कोई भी व्यावसायिक प्रश्न पूछें' : 'Ask any merchant business question')}
              </h3>
              <p className="text-xs text-[#6B7280] mt-0.5 mb-4">
                {currentLang === 'mr' 
                  ? 'गुल्लक थेट रोजच्या साउंडबॉक्स नोंदी, साठा व बँक खात्याच्या आधारे अचूक उत्तरे देईल.' 
                  : 'Gullak analyzes real-time QR Soundbox transactions, stock levels & settlement data.'}
              </p>

              {/* Sample Prompts */}
              <div className="text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block mb-2">
                  Suggested Business Questions:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentPresets.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuery(p.query)}
                      className="text-left p-2.5 bg-white border border-[#E5E7EB] hover:border-[#002970]/50 rounded-lg text-xs transition"
                    >
                      <span className="font-semibold text-[#002970] block text-[11px]">{p.label}</span>
                      <span className="text-[#6B7280] block mt-0.5 line-clamp-1">"{p.query}"</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            history.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3.5 py-2.5 text-xs sm:text-sm ${
                    msg.sender === 'user'
                      ? 'bg-[#002970] text-white'
                      : 'bg-white text-[#1A1A1A] border border-[#E5E7EB]'
                  }`}
                >
                  {msg.agentName && (
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#002970] bg-[#002970]/8 px-1.5 py-0.2 rounded">
                        {msg.agentName}
                      </span>
                      {msg.intent && (
                        <span className="text-[10px] font-medium text-[#00875A] bg-[#00875A]/10 px-1.5 py-0.2 rounded">
                          {msg.intent}
                        </span>
                      )}
                    </div>
                  )}
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                </div>

                {msg.whyExplanation && (
                  <div className="w-full max-w-[85%] mt-1">
                    <WhyExplanationCard
                      explanation={msg.whyExplanation}
                      suggestedAction={msg.suggestedAction}
                      dataSources={["Store Transactions", "Festive Forecast Model", "Current Stock"]}
                      lang={currentLang}
                    />
                  </div>
                )}

                {msg.approvalRequired && (
                  <div className="mt-1.5 p-2.5 bg-[#E99A00]/10 border border-[#E99A00]/25 rounded-lg max-w-[85%] flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-[#E99A00] flex-shrink-0" />
                      <span className="font-semibold text-[#805500]">Requires Merchant Approval</span>
                    </div>
                    <button
                      onClick={() => onNavigate('kriya')}
                      className="px-2.5 py-1 bg-[#002970] text-white font-bold rounded text-xs transition flex items-center gap-1"
                    >
                      <span>Review in Actions</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Live Audio Feedback */}
        <div className="p-2 border-t border-[#E5E7EB] bg-white">
          <Waveform active={isRecording || loading} />
          <p className="text-center text-xs font-medium text-[#6B7280] mt-0.5">
            {interimTranscript ? `"${interimTranscript}"` : status}
          </p>
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-[#E5E7EB] bg-white flex items-center gap-2">
          <button
            onClick={toggleMic}
            className={`w-10 h-10 rounded-lg flex items-center justify-center text-white transition flex-shrink-0 ${
              isRecording ? 'bg-[#D92D20] animate-pulse' : 'bg-[#002970] hover:bg-[#071E46]'
            }`}
            title={isRecording ? 'Stop' : 'Speak'}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
            placeholder={
              currentLang === 'mr' 
                ? "मराठीत विचारा (उदा. 'आज किती विक्री झाली?')" 
                : (currentLang === 'hi' ? "हिन्दी में पूछें (जैसे 'आज की बिक्री कितनी हुई?')" : "Ask in English (e.g. 'Show today's sales')")
            }
            className="flex-1 px-3.5 py-2 bg-[#F5F7FA] border border-[#E5E7EB] rounded-lg text-xs sm:text-sm text-[#1A1A1A] focus:outline-none focus:border-[#002970] focus:bg-white transition"
          />

          <button
            onClick={() => handleQuery()}
            disabled={!inputText.trim()}
            className="w-10 h-10 rounded-lg bg-[#002970] hover:bg-[#071E46] text-white flex items-center justify-center disabled:opacity-40 transition flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}
