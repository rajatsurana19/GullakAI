import React, { useState } from 'react';
import { 
  X, 
  Send, 
  CheckCheck, 
  Phone, 
  Video, 
  MoreVertical, 
  ArrowLeft, 
  Smile, 
  Paperclip, 
  Mic, 
  Sparkles,
  ShoppingBag,
  Store,
  CheckCircle2
} from 'lucide-react';

export default function WhatsAppSimulatorModal({ 
  isOpen, 
  onClose, 
  campaignData, 
  customerName = "Rajesh Sharma",
  storeName = "Shree Shakti Kirana Store",
  includeDiscount = true
}) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [customerReplied, setCustomerReplied] = useState(false);

  if (!isOpen) return null;

  const defaultMessage = includeDiscount 
    ? `Hi ${customerName.split(' ')[0]} ji! 👋\n\nIt's been a while since we saw you at ${storeName}. Your favourite Pure Desi Cow Ghee & Dry Fruits are back in stock!\n\n🎁 Get ₹100 OFF on orders above ₹1,000 this week. 💚\n\nVisit us soon!\n- ${storeName}`
    : `Hi ${customerName.split(' ')[0]} ji! 👋\n\nIt's been a while since we saw you at ${storeName}. Fresh stock of your favourite Pure Desi Cow Ghee & Festive items are now available!\n\nVisit us soon to pick up your essentials! 💚\n- ${storeName}`;

  const currentMessageText = campaignData?.message || defaultMessage;

  const handleQuickReply = (replyText) => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        sender: 'customer',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setCustomerReplied(true);
  };

  const handleSendCustomReply = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    handleQuickReply(inputText);
    setInputText("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full max-w-sm sm:max-w-md bg-[#ECE5DD] rounded-3xl shadow-2xl overflow-hidden border border-slate-300 flex flex-col h-[85vh] max-h-[700px]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* WhatsApp Top Green Header Bar (#075E54) */}
        <div className="bg-[#075E54] text-white px-3 sm:px-4 py-3 flex items-center justify-between shadow-md select-none flex-shrink-0">
          <div className="flex items-center gap-2">
            <button 
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded-full transition text-white"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Merchant Avatar with verified badge */}
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-[#075E54] flex items-center justify-center font-bold text-xs shadow-xs">
                <Store className="w-5 h-5" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#075E54] flex items-center justify-center text-white text-[8px] font-black">
                ✓
              </span>
            </div>

            <div className="leading-tight truncate max-w-[170px] sm:max-w-[210px]">
              <div className="font-bold text-sm truncate flex items-center gap-1">
                <span>{storeName}</span>
                <span className="text-emerald-300 text-[10px]">✔</span>
              </div>
              <div className="text-[10px] text-emerald-100 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                <span>Verified Business Account</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-white/90">
            <Video className="w-4 h-4 cursor-pointer hover:text-white" />
            <Phone className="w-4 h-4 cursor-pointer hover:text-white" />
            <MoreVertical className="w-4 h-4 cursor-pointer hover:text-white" />
          </div>
        </div>

        {/* Chat Body (Classic WhatsApp Wallpaper pattern) */}
        <div 
          className="flex-1 p-3.5 overflow-y-auto space-y-3 font-sans"
          style={{
            backgroundImage: `radial-gradient(#d1c7bc 1px, transparent 1px)`,
            backgroundSize: '16px 16px'
          }}
        >
          {/* Today Date Pill */}
          <div className="flex justify-center my-1">
            <span className="bg-white/80 backdrop-blur-xs text-slate-600 text-[10px] font-bold px-3 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
              Today
            </span>
          </div>

          {/* End-to-end encryption note */}
          <div className="bg-[#FFEECD] text-[#55462D] rounded-xl p-2 text-center text-[10px] leading-tight shadow-2xs border border-[#F5DC9A] max-w-[290px] mx-auto">
            🔒 Messages and calls are end-to-end encrypted. No one outside of this chat can read or listen to them.
          </div>

          {/* Business Broadcast Bubble from Store to Customer */}
          <div className="flex justify-start">
            <div className="bg-white text-slate-900 rounded-2xl rounded-tl-xs p-3 max-w-[85%] shadow-sm border border-slate-200/60 space-y-2">
              <div className="text-xs leading-relaxed whitespace-pre-line text-slate-800 font-normal">
                {currentMessageText}
              </div>

              {includeDiscount && (
                <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShoppingBag className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Coupon: DIWALI100</span>
                  </div>
                  <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-md font-bold">
                    ₹100 OFF
                  </span>
                </div>
              )}

              <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 font-mono mt-1">
                <span>10:30 AM</span>
                <CheckCheck className="w-3.5 h-3.5 text-sky-500" />
              </div>
            </div>
          </div>

          {/* Customer Responses (Simulated in green outgoing bubbles) */}
          {messages.map((m) => (
            <div key={m.id} className="flex justify-end animate-fade-in">
              <div className="bg-[#E7FFDB] text-slate-900 rounded-2xl rounded-tr-xs p-3 max-w-[82%] shadow-sm border border-emerald-200/60">
                <p className="text-xs leading-relaxed text-slate-800">{m.text}</p>
                <div className="flex items-center justify-end gap-1 text-[10px] text-slate-500 font-mono mt-1">
                  <span>{m.time}</span>
                  <CheckCheck className="w-3.5 h-3.5 text-sky-500" />
                </div>
              </div>
            </div>
          ))}

          {/* Quick Reply Prompts for Demo Walkthrough */}
          {!customerReplied && (
            <div className="p-2 bg-white/90 backdrop-blur-xs rounded-2xl border border-slate-200 space-y-1.5 shadow-xs">
              <div className="text-[10px] font-extrabold uppercase text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#128C7E]" />
                <span>Simulate Customer Interaction ({customerName}):</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => handleQuickReply("Will come today to buy Ghee & Dry Fruits! 🛍️")}
                  className="w-full text-left p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-semibold border border-emerald-200 transition"
                >
                  "Will come today to buy Ghee & Dry Fruits! 🛍️"
                </button>
                <button
                  onClick={() => handleQuickReply("Thank you! Please keep 2 kg Ghee aside for me. 😊")}
                  className="w-full text-left p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-semibold border border-emerald-200 transition"
                >
                  "Thank you! Please keep 2 kg Ghee aside for me. 😊"
                </button>
              </div>
            </div>
          )}

          {customerReplied && (
            <div className="p-2 bg-emerald-100/90 text-emerald-900 rounded-xl text-center text-xs font-bold border border-emerald-300 flex items-center justify-center gap-1.5 animate-bounce">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Customer returned! Incremental revenue verified.</span>
            </div>
          )}
        </div>

        {/* Bottom Simulated Input Bar */}
        <form 
          onSubmit={handleSendCustomReply}
          className="p-2.5 bg-[#F0F2F5] flex items-center gap-2 border-t border-slate-200 flex-shrink-0"
        >
          <div className="flex-1 bg-white rounded-full px-3 py-2 flex items-center gap-2 shadow-xs border border-slate-200">
            <Smile className="w-4 h-4 text-slate-400 cursor-pointer" />
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Reply as customer..."
              className="flex-1 text-xs outline-none bg-transparent"
            />
            <Paperclip className="w-4 h-4 text-slate-400 cursor-pointer" />
          </div>

          {inputText ? (
            <button
              type="submit"
              className="w-9 h-9 rounded-full bg-[#128C7E] hover:bg-[#075E54] text-white flex items-center justify-center shadow-sm transition"
            >
              <Send className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#128C7E] text-white flex items-center justify-center shadow-sm">
              <Mic className="w-4 h-4" />
            </div>
          )}
        </form>

      </div>
    </div>
  );
}
