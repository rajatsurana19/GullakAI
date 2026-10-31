import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  Phone, 
  ShoppingBag, 
  Clock, 
  Tag, 
  ArrowRight,
  ArrowLeft,
  TrendingUp, 
  ShieldCheck, 
  MessageSquare, 
  Calendar,
  AlertCircle,
  Check,
  Eye,
  Info,
  ChevronRight,
  Gift
} from 'lucide-react';
import { apiClient } from '../api/client';
import { translations, formatLocalizedNumber, formatLocalizedCurrency } from '../i18n/translations';
import WhatsAppSimulatorModal from '../components/chat/WhatsAppSimulatorModal';
import EvidenceModal from '../components/modals/EvidenceModal';

export default function GrahakPage({ currentLang = 'mr', onNavigate }) {
  // Current view matching user's image screens:
  // 'list' (Screen 2: Customer Insights List)
  // 'detail' (Screen 3: Customer Detail & Analysis)
  // 'preview' (Screen 4: Campaign Preview with coupon toggle)
  // 'execution' (Screen 5 & 6: Approval, Stepper & Live Delivery)
  // 'results' (Screen 7: Results & Control Comparison)
  // 'learnings' (Screen 8: AI Learnings)
  const [view, setView] = useState('list');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [includeDiscount, setIncludeDiscount] = useState(true);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);
  const [campaignApproved, setCampaignApproved] = useState(false);
  const [deliveryProgress, setDeliveryProgress] = useState(8);

  const t = translations[currentLang] || translations.mr;

  const sampleCustomers = [
    {
      id: "c1",
      name: "Rajesh Sharma",
      initials: "RS",
      daysAgo: 63,
      avgOrder: 850,
      totalPurchases: 24,
      frequencyDays: 18,
      totalSpend: 4200,
      segment: "High Value",
      preferred: ["Pure Desi Ghee", "Dry Fruits", "Atta", "Spices"],
      whyMatters: "Rajesh usually visits every 15-20 days and hasn't returned for 63 days. He primarily buys pure ghee and dry fruits. He spent ₹20,000+ in the last 6 months and is highly responsive to festive greetings."
    },
    {
      id: "c2",
      name: "Pooja Singh",
      initials: "PS",
      daysAgo: 68,
      avgOrder: 620,
      totalPurchases: 19,
      frequencyDays: 20,
      totalSpend: 3100,
      segment: "High Value",
      preferred: ["Refined Oil", "Terracotta Diyas", "Sugar"],
      whyMatters: "Pooja visits every 3 weeks for household cooking essentials. She hasn't visited in 68 days. Reaching out with a festive reminder has a 45% return probability."
    },
    {
      id: "c3",
      name: "Mohit Saini",
      initials: "MS",
      daysAgo: 72,
      avgOrder: 1200,
      totalPurchases: 14,
      frequencyDays: 22,
      totalSpend: 2800,
      segment: "High Value",
      preferred: ["Pure Desi Ghee", "Basmati Rice", "Dry Fruits"],
      whyMatters: "High basket size buyer (₹1,200 avg order). Inactive for 72 days. He is at severe risk of migrating permanently to quick-commerce apps."
    },
    {
      id: "c4",
      name: "Anjali Sharma",
      initials: "AS",
      daysAgo: 74,
      avgOrder: 780,
      totalPurchases: 12,
      frequencyDays: 25,
      totalSpend: 2100,
      segment: "Medium Value",
      preferred: ["Diwali Diya Pack", "Saffron", "Dry Fruits"],
      whyMatters: "Festive seasonal buyer. Primarily restocks prior to Dhanteras and Diwali Pooja."
    },
    {
      id: "c5",
      name: "Vikram Desai",
      initials: "VD",
      daysAgo: 77,
      avgOrder: 520,
      totalPurchases: 10,
      frequencyDays: 30,
      totalSpend: 1600,
      segment: "Medium Value",
      preferred: ["Tea & Sugar", "Snacks", "Ghee"],
      whyMatters: "Neighborhood customer who has reduced purchase frequency over the last 2 months."
    }
  ];

  const activeCustomer = selectedCustomer || sampleCustomers[0];

  const handleApproveAndSend = () => {
    setCampaignApproved(true);
    setView('execution');
    // Simulate live delivery progress increment
    setDeliveryProgress(4);
    setTimeout(() => setDeliveryProgress(8), 1200);
    setTimeout(() => setDeliveryProgress(12), 2400);
  };

  const grahakStrings = {
    mr: {
      title: "ग्राहक वाढ व सण मोहीम",
      sub: "नियमित जुन्या ग्राहकांना परत आणा, व्हॉट्सॲप सवलत पाठवा व थेट नफा तपासा",
      evidenceBtn: "कारणे व पुरावे",
      tab1: "१. जुने ग्राहक (१२)",
      tab2: "२. संदेश मसुदा",
      tab3: "३. थेट पाठवणे",
      tab4: "४. प्रत्यक्ष निकाल",
      tab5: "५. गुल्लक शिकवण"
    },
    hi: {
      title: "ग्राहक वृद्धि व त्योहार कैंपेन",
      sub: "दुकान से छूटे पुराने ग्राहकों को वापस लाएं, व्हाट्सएप ऑफर भेजें और शुद्ध मुनाफा मापें",
      evidenceBtn: "कारण व प्रमाण",
      tab1: "१. पुराने ग्राहक (12)",
      tab2: "२. संदेश ड्राफ्ट",
      tab3: "३. लाइव प्रसारण",
      tab4: "४. वास्तविक परिणाम",
      tab5: "५. एआई सीख"
    },
    en: {
      title: "Customer Growth Copilot",
      sub: "Identify valuable lapsed customers, draft personalized WhatsApp offers & measure incremental sales",
      evidenceBtn: "Causal Evidence",
      tab1: "1. Inactive Customers (12)",
      tab2: "2. Campaign Preview",
      tab3: "3. Live Broadcast",
      tab4: "4. Uplift Results",
      tab5: "5. System Learnings"
    }
  };
  const gs = grahakStrings[currentLang] || grahakStrings.mr;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 md:pb-8 font-sans animate-fade-in">

      {/* Top Header & Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {view !== 'list' && (
            <button
              onClick={() => {
                if (view === 'detail') setView('list');
                else if (view === 'preview') setView('detail');
                else if (view === 'execution') setView('preview');
                else if (view === 'results') setView('execution');
                else if (view === 'learnings') setView('results');
                else setView('list');
              }}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition text-slate-700 shadow-2xs"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-paytm-navy">
                {gs.title}
              </h2>
              <span className="text-[10px] font-black uppercase bg-paytm-blue/10 text-paytm-blue px-2 py-0.5 rounded-full">
                Paytm AI
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {gs.sub}
            </p>
          </div>
        </div>

        {/* View Evidence Button */}
        <button
          onClick={() => setShowEvidence(true)}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-paytm-blue text-xs font-bold border border-blue-200 transition"
        >
          <Info className="w-4 h-4" />
          <span>{gs.evidenceBtn}</span>
        </button>
      </div>

      {/* Surface Sub-navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
        <button
          onClick={() => setView('list')}
          className={`px-3.5 py-1.5 rounded-xl transition ${
            view === 'list' || view === 'detail'
              ? 'bg-paytm-blue text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          {gs.tab1}
        </button>
        <button
          onClick={() => setView('preview')}
          className={`px-3.5 py-1.5 rounded-xl transition ${
            view === 'preview'
              ? 'bg-paytm-blue text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          {gs.tab2}
        </button>
        <button
          onClick={() => setView('execution')}
          className={`px-3.5 py-1.5 rounded-xl transition ${
            view === 'execution'
              ? 'bg-paytm-blue text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          {gs.tab3}
        </button>
        <button
          onClick={() => setView('results')}
          className={`px-3.5 py-1.5 rounded-xl transition ${
            view === 'results'
              ? 'bg-paytm-blue text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          {gs.tab4}
        </button>
        <button
          onClick={() => setView('learnings')}
          className={`px-3.5 py-1.5 rounded-xl transition ${
            view === 'learnings'
              ? 'bg-paytm-blue text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          {gs.tab5}
        </button>
      </div>

      {/* ======================================================== */}
      {/* SCREEN 2: CUSTOMER INSIGHTS LIST                        */}
      {/* ======================================================== */}
      {view === 'list' && (
        <div className="space-y-4 animate-fade-in">
          
          {/* Blue Summary Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-3xl p-5 sm:p-6 shadow-2xs">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-paytm-blue text-white flex items-center justify-center font-bold flex-shrink-0 mt-0.5 shadow-xs">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-paytm-navy">
                    12 high-value customers haven't returned in 60 days
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-paytm-blue font-bold">
                      Potential revenue: ₹18,000
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500">Based on 180-day purchase frequency</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setView('preview')}
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-paytm-blue hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition shadow-xs flex-shrink-0"
              >
                <span>Draft Campaign</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Feature Pills */}
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-blue-200/60 flex-wrap text-xs">
              <span className="px-2.5 py-1 rounded-full bg-white text-slate-700 font-semibold border border-slate-200/80 shadow-3xs">
                Personalized Offers
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white text-slate-700 font-semibold border border-slate-200/80 shadow-3xs">
                WhatsApp Campaign
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white text-slate-700 font-semibold border border-slate-200/80 shadow-3xs">
                Merchant Approval
              </span>
            </div>
          </div>

          {/* List of Lapsed Customers */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Top Customers (Sort by: Highest Value)
              </span>
              <span className="text-xs font-bold text-paytm-blue">12 identified</span>
            </div>

            <div className="divide-y divide-slate-100">
              {sampleCustomers.map((cust) => (
                <div
                  key={cust.id}
                  onClick={() => {
                    setSelectedCustomer(cust);
                    setView('detail');
                  }}
                  className="py-3 px-2 flex items-center justify-between hover:bg-slate-50/80 rounded-2xl transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-paytm-blue/10 text-paytm-blue font-extrabold flex items-center justify-center text-xs group-hover:bg-paytm-blue group-hover:text-white transition">
                      {cust.initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm">{cust.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                          cust.segment === 'High Value'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {cust.segment}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Last visit: {cust.daysAgo} days ago • ₹{cust.avgOrder} avg order
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-black text-slate-900 text-sm">
                        ₹{cust.totalSpend.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-slate-400">historical spend</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-paytm-blue transition" />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setView('preview')}
                className="w-full py-3 bg-paytm-blue hover:bg-blue-600 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Prepare WhatsApp Win-Back Campaign for All 12</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* SCREEN 3: CUSTOMER DETAIL & ANALYSIS                    */}
      {/* ======================================================== */}
      {view === 'detail' && (
        <div className="space-y-4 animate-fade-in">
          
          {/* Customer Profile Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-paytm-blue text-white flex items-center justify-center text-lg font-black shadow-sm">
                {activeCustomer.initials}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900">{activeCustomer.name}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    High Value Customer
                  </span>
                </div>
                <div className="text-xs text-rose-600 font-bold mt-0.5">
                  Last Visit: {activeCustomer.daysAgo} days ago
                </div>
              </div>
            </div>

            {/* 3 Metric Stats Row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 text-center">
                <div className="text-[11px] text-slate-500">Avg Order Value</div>
                <div className="text-base font-black text-slate-900 mt-0.5">₹{activeCustomer.avgOrder}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 text-center">
                <div className="text-[11px] text-slate-500">Total Purchases</div>
                <div className="text-base font-black text-slate-900 mt-0.5">{activeCustomer.totalPurchases}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 text-center">
                <div className="text-[11px] text-slate-500">Avg. Frequency</div>
                <div className="text-base font-black text-slate-900 mt-0.5">{activeCustomer.frequencyDays} days</div>
              </div>
            </div>

            {/* Purchase History Tags */}
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-slate-700">Purchase History:</div>
              <div className="flex items-center gap-2 flex-wrap">
                {activeCustomer.preferred.map((item, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold flex items-center gap-1.5">
                    <ShoppingBag className="w-3 h-3 text-amber-700" />
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* AI Analysis Box */}
            <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200/70 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-black text-paytm-blue">
                <Sparkles className="w-4 h-4" />
                <span>Why this customer matters? (AI Analysis)</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {activeCustomer.whyMatters}
              </p>
            </div>

            {/* Recommended Action Card */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-emerald-950 text-xs">Recommended Action:</div>
                  <div className="text-xs text-emerald-800 font-medium mt-0.5">
                    Send a personalized WhatsApp offer for Pure Ghee + Dry Fruits combo
                  </div>
                </div>
              </div>

              <button
                onClick={() => setView('preview')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex-shrink-0 flex items-center justify-center gap-1.5"
              >
                <span>View Campaign Preview</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* SCREEN 4: CAMPAIGN PREVIEW (WITH COUPON TOGGLE OPTION)  */}
      {/* ======================================================== */}
      {view === 'preview' && (
        <div className="space-y-4 animate-fade-in">
          
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  WhatsApp Cloud API
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  WhatsApp Campaign Preview
                </h3>
                <p className="text-xs text-slate-500">
                  Targeted to 12 high-value lapsed customers • Estimated additional revenue: ₹4,000 – ₹6,000
                </p>
              </div>

              {/* NEW REQUEST: TOGGLE DISCOUNT COUPON ON/OFF */}
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-200 self-start sm:self-auto">
                <Gift className={`w-4 h-4 ${includeDiscount ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className="text-xs font-bold text-slate-700">
                  {includeDiscount ? "₹100 Discount Coupon Included" : "No Coupon (Store Greeting Only)"}
                </span>
                <input 
                  type="checkbox"
                  checked={includeDiscount}
                  onChange={(e) => setIncludeDiscount(e.target.checked)}
                  className="w-4 h-4 text-paytm-blue rounded focus:ring-paytm-blue cursor-pointer"
                />
              </div>
            </div>

            {/* Realistic WhatsApp Chat Bubble Preview */}
            <div 
              className="p-4 rounded-2xl bg-[#ECE5DD] border border-slate-300"
              style={{
                backgroundImage: `radial-gradient(#d1c7bc 1px, transparent 1px)`,
                backgroundSize: '16px 16px'
              }}
            >
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 max-w-sm space-y-2.5">
                <p className="text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-line">
                  {includeDiscount ? (
`Hi Rajesh ji! 👋

It's been a while since we saw you at Shree Shakti Kirana Store. Your favourite Pure Desi Cow Ghee & Dry Fruits are back in fresh stock!

🎁 Get ₹100 OFF on orders above ₹1,000 this week. 💚

Visit us soon!
- Shree Shakti Kirana Store`
                  ) : (
`Hi Rajesh ji! 👋

It's been a while since we saw you at Shree Shakti Kirana Store. Fresh stock of your favourite Pure Desi Cow Ghee & Festive items are now available!

Visit us soon to pick up your essentials! 💚
- Shree Shakti Kirana Store`
                  )}
                </p>
                <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 font-mono">
                  <span>10:30 AM</span>
                  <span className="text-sky-500 font-bold">✓✓</span>
                </div>
              </div>
            </div>

            {/* Expected Impact Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-center">
                <div className="text-[11px] text-slate-500">{currentLang === 'mr' ? 'लक्ष्य ग्राहक' : currentLang === 'hi' ? 'लक्षित ग्राहक' : 'Target Customers'}</div>
                <div className="text-base font-black text-slate-900 mt-0.5">
                  {formatLocalizedNumber(12, currentLang)} {currentLang === 'mr' ? 'ग्राहक' : currentLang === 'hi' ? 'ग्राहक' : 'Customers'}
                </div>
                <div className="text-[10px] text-slate-400">{currentLang === 'mr' ? '३०+ दिवस निष्क्रिय' : currentLang === 'hi' ? '30+ दिन से छूटे' : 'High-value lapsed'}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-center">
                <div className="text-[11px] text-slate-500">{currentLang === 'mr' ? 'कमाल सवलत खर्च' : currentLang === 'hi' ? 'अधिकतम छूट लागत' : 'Max Campaign Cost'}</div>
                <div className="text-base font-black text-slate-900 mt-0.5">
                  {includeDiscount ? formatLocalizedCurrency(1200, currentLang) : formatLocalizedCurrency(0, currentLang)}
                </div>
                <div className="text-[10px] text-slate-400">
                  {includeDiscount ? (currentLang === 'mr' ? '₹१०० कूपन कमाल मर्यादा' : currentLang === 'hi' ? '₹100 कूपन अधिकतम' : '₹100 coupon subsidy') : (currentLang === 'mr' ? 'शून्य खर्च' : currentLang === 'hi' ? 'शून्य खर्च' : 'Zero discount cost')}
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                <div className="text-[11px] text-emerald-800 font-bold">{currentLang === 'mr' ? 'अपेक्षित जास्तीची विक्री' : currentLang === 'hi' ? 'अनुमानित बिक्री वृद्धि' : 'Expected Revenue'}</div>
                <div className="text-base font-black text-emerald-700 mt-0.5">
                  {formatLocalizedCurrency(4000, currentLang)} – {formatLocalizedCurrency(6000, currentLang)}
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold">{currentLang === 'mr' ? 'किमान ३५%+ परतफेड दर' : currentLang === 'hi' ? 'न्यूनतम 35%+ वापसी दर' : 'Net 35%+ return rate'}</div>
              </div>
            </div>

            {/* Improvement 4: Offer Profit Guard */}
            <div className="p-4 rounded-xl bg-[#00875A]/5 border border-[#00875A]/25 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#00875A]" />
                  <span className="font-bold text-xs text-[#00875A] uppercase tracking-wider">
                    {t.profitGuardTitle}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-[#00875A] bg-[#00875A]/15 px-2 py-0.5 rounded border border-[#00875A]/25">
                  {t.profitGuardVerdictSafe}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="p-2 bg-white rounded-lg border border-[#00875A]/20">
                  <span className="text-[#6B7280] block text-[10px]">{t.grossMarginLabel}:</span>
                  <span className="font-bold text-[#1A1A1A]">{currentLang === 'mr' ? '२४% (तूप व मिठाई)' : currentLang === 'hi' ? '24% (घी व मिठाई)' : '24% (Ghee & Sweets)'}</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-[#00875A]/20">
                  <span className="text-[#6B7280] block text-[10px]">{t.discountRateLabel}:</span>
                  <span className="font-bold text-[#002970]">{includeDiscount ? (currentLang === 'mr' ? '१०% (किंवा ₹१००)' : currentLang === 'hi' ? '10% (या ₹100)' : '10% (₹100 on ₹1k)') : '0%'}</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-[#00875A]/20">
                  <span className="text-[#6B7280] block text-[10px]">{t.broadcastCostLabel}:</span>
                  <span className="font-bold text-[#1A1A1A]">{formatLocalizedCurrency(4.2, currentLang)} (12 × ₹0.35)</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-[#00875A]/20">
                  <span className="text-[#6B7280] block text-[10px]">{t.breakevenOrdersLabel}:</span>
                  <span className="font-bold text-[#00875A]">{currentLang === 'mr' ? 'फक्त १ ग्राहक खरेदी' : currentLang === 'hi' ? 'केवल 1 ग्राहक खरीद' : 'Only 1 customer'}</span>
                </div>
              </div>

              <p className="text-[11px] text-[#4B5563] leading-relaxed">
                {currentLang === 'mr' 
                  ? 'गुल्लक नफा रक्षक: जर फक्त एका ग्राहकाने ₹१,००० ची खरेदी केली तरीही सर्व मेसेज खर्च वसूल होऊन दुकानाला निव्वळ ₹१४० नफा राहतो. अंदाजे ५ ग्राहक परत आल्यास निव्वळ नफा +₹१,८५० राहील.'
                  : currentLang === 'hi'
                  ? 'गुल्लक प्रॉफिट गार्ड: अगर सिर्फ 1 ग्राहक भी ₹1,000 का सामान लेता है तो सारा खर्च निकलकर ₹140 शुद्ध मुनाफा रहता है। अनुमानित 5 ग्राहक आने पर शुद्ध लाभ +₹1,850 रहेगा।'
                  : 'Gullak Profit Guard: Even if only 1 shopper returns with a ₹1,000 basket, all costs are covered with ₹140 net profit. With 5 expected returnees, net profit is protected at +₹1,850.'}
              </p>
            </div>

            {/* Actions: Approve & Send + Simulator Preview */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleApproveAndSend}
                className="w-full sm:flex-1 py-3 bg-paytm-blue hover:bg-blue-600 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Approve & Send via WhatsApp</span>
              </button>

              <button
                onClick={() => setIsWhatsAppModalOpen(true)}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs border border-emerald-300 transition flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4 text-emerald-700" />
                <span>Simulate WhatsApp Flow (Customer View)</span>
              </button>
            </div>

          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* SCREEN 5 & 6: APPROVAL, STEPPER & LIVE DELIVERY REPORT   */}
      {/* ======================================================== */}
      {view === 'execution' && (
        <div className="space-y-4 animate-fade-in">
          
          {/* Stepper Timeline Card (Screen 5) */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5">
            <h3 className="text-base font-black text-paytm-navy">
              Campaign Status & Delivery Stepper
            </h3>

            <div className="space-y-3 relative pl-6 before:content-[''] before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
              
              {/* Step 1 */}
              <div className="relative flex items-start gap-3">
                <div className="absolute -left-6 mt-0.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                  ✓
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Approved by Merchant</div>
                  <div className="text-[11px] text-slate-500">1-Tap biometric/PIN approval confirmed • Apr 28, 2025 • 10:45 AM</div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative flex items-start gap-3">
                <div className="absolute -left-6 mt-0.5 w-5 h-5 rounded-full bg-paytm-blue text-white flex items-center justify-center text-[10px] font-bold">
                  ✓
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Campaign Scheduled</div>
                  <div className="text-[11px] text-slate-500">Scheduled for 11:00 AM WhatsApp Cloud API broadcast</div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative flex items-start gap-3">
                <div className="absolute -left-6 mt-0.5 w-5 h-5 rounded-full bg-paytm-cyan text-paytm-navy flex items-center justify-center text-[10px] font-bold animate-pulse">
                  ●
                </div>
                <div>
                  <div className="text-xs font-bold text-paytm-blue">Executing Delivery</div>
                  <div className="text-[11px] text-slate-600">Sending to 12 selected high-value customers...</div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative flex items-start gap-3 opacity-60">
                <div className="absolute -left-6 mt-0.5 w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px] font-bold">
                  4
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-700">Tracking Results</div>
                  <div className="text-[11px] text-slate-500">Will be updated in 7-14 days via 20% holdout uplift math</div>
                </div>
              </div>

            </div>
          </div>

          {/* Live Delivery Progress Card (Screen 6) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col items-center text-center space-y-4">
            
            {/* Circular Progress Gauge */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500 transition-all duration-700 ease-out"
                  strokeDasharray={`${(deliveryProgress / 12) * 100}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-2xl font-black text-slate-900">{deliveryProgress}/12</span>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Messages</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 font-bold text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Delivered: {deliveryProgress}</span>
              </span>
              <span className="flex items-center gap-1.5 font-bold text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                <span>Pending: {12 - deliveryProgress}</span>
              </span>
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 max-w-md">
              <strong>Campaign is live!</strong> Messages are being delivered via official WhatsApp Business Cloud API.
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setView('results')}
                className="px-5 py-2.5 bg-paytm-blue hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                View Campaign Results & Lift →
              </button>
              <button
                onClick={() => setIsWhatsAppModalOpen(true)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                Open WhatsApp Simulator
              </button>
            </div>

          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* SCREEN 7: RESULTS & IMPACT (20% HOLDOUT COMPARISON TABLE)*/}
      {/* ======================================================== */}
      {view === 'results' && (
        <div className="space-y-4 animate-fade-in">
          
          {/* Header Range */}
          <div className="flex items-center justify-between text-xs text-slate-500 bg-white p-3.5 rounded-2xl border border-slate-200">
            <span className="flex items-center gap-1.5 font-bold text-slate-700">
              <Calendar className="w-4 h-4 text-paytm-blue" />
              <span>Evaluation Window: Apr 28 – May 12 (14 days)</span>
            </span>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
              Closed-Loop Verified
            </span>
          </div>

          {/* 3 Results Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs text-center">
              <div className="text-[11px] text-slate-500 font-bold">Customers Returned</div>
              <div className="text-2xl font-black text-slate-900 mt-1">5 / 12</div>
              <div className="text-xs font-bold text-emerald-600 mt-0.5">41.7% Return Rate</div>
            </div>

            <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs text-center">
              <div className="text-[11px] text-slate-500 font-bold">New Purchases</div>
              <div className="text-2xl font-black text-slate-900 mt-1">3 Orders</div>
              <div className="text-xs font-bold text-slate-600 mt-0.5">₹6,800 Total Revenue</div>
            </div>

            <div className="p-4 bg-emerald-50 rounded-3xl border border-emerald-200 shadow-xs text-center">
              <div className="text-[11px] text-emerald-800 font-bold">Est. Incremental Revenue</div>
              <div className="text-2xl font-black text-emerald-700 mt-1">+₹4,700</div>
              <div className="text-xs font-bold text-emerald-600 mt-0.5">vs 20% Holdout Control</div>
            </div>
          </div>

          {/* Side-by-side Table: Campaign vs Control */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-sm font-black text-slate-900">
                Customer Behaviour: Campaign vs Control Group
              </h4>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded">
                Gold Standard 20% Holdout
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold">
                    <th className="text-left pb-2">Metric</th>
                    <th className="text-center pb-2 text-paytm-blue font-black">Campaign (Treated)</th>
                    <th className="text-center pb-2 text-slate-600">Control (Holdout)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2.5 font-bold text-slate-800">Customers</td>
                    <td className="py-2.5 text-center font-bold text-paytm-blue">12</td>
                    <td className="py-2.5 text-center text-slate-600">12</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-slate-800">Returned</td>
                    <td className="py-2.5 text-center font-black text-emerald-600">5 (41.7%)</td>
                    <td className="py-2.5 text-center text-slate-600">2 (16.7%)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-slate-800">Revenue</td>
                    <td className="py-2.5 text-center font-black text-emerald-600">₹6,800</td>
                    <td className="py-2.5 text-center text-slate-600">₹2,100</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-slate-800">Avg. Order Value</td>
                    <td className="py-2.5 text-center font-bold text-slate-800">₹1,360</td>
                    <td className="py-2.5 text-center text-slate-600">₹1,050</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Incremental Summary Callout */}
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                <strong>3 additional customers returned</strong> compared to control group. Estimated incremental revenue: <strong>+₹4,700</strong>.
              </span>
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between">
            <button
              onClick={() => setView('learnings')}
              className="px-5 py-2.5 bg-paytm-blue hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              View AI Learnings & Feedback Loop →
            </button>
            <button
              onClick={() => setIsWhatsAppModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 transition"
            >
              View in WhatsApp Simulator
            </button>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* SCREEN 8: AI LEARNINGS & FEEDBACK LOOP                  */}
      {/* ======================================================== */}
      {view === 'learnings' && (
        <div className="space-y-4 animate-fade-in">
          
          {/* Success Banner */}
          <div className="p-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl shadow-xs space-y-1">
            <span className="text-[10px] uppercase font-black px-2 py-0.5 bg-white/20 rounded-full">
              Automated Learning Confirmed
            </span>
            <h3 className="text-base sm:text-lg font-black mt-1">
              This campaign was successful! You recovered ₹4,700 in incremental revenue.
            </h3>
            <p className="text-xs text-emerald-100">
              Gullak AI has analyzed customer responses and updated ranking weights for future store recommendations.
            </p>
          </div>

          {/* What Worked Best Breakdown */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
            <h4 className="text-sm font-black text-slate-900">What worked best?</h4>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
                <div>
                  <span className="font-bold text-slate-800">1. Personalized offer</span>
                  <p className="text-[11px] text-slate-500">₹100 off above ₹1,000 threshold</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                  High Impact
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
                <div>
                  <span className="font-bold text-slate-800">2. Mention of preferred products</span>
                  <p className="text-[11px] text-slate-500">Pure Ghee + Festive Dry Fruits</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                  High Impact
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
                <div>
                  <span className="font-bold text-slate-800">3. WhatsApp Business channel</span>
                  <p className="text-[11px] text-slate-500">Direct message on merchant registered WhatsApp</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-paytm-blue rounded-full">
                  Medium Impact
                </span>
              </div>
            </div>
          </div>

          {/* Applied Learning Box */}
          <div className="p-5 bg-blue-50/70 rounded-3xl border border-blue-200 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-black text-paytm-blue">
              <Sparkles className="w-4 h-4" />
              <span>Applied Learning for Future Actions:</span>
            </div>
            <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-4 leading-relaxed">
              <li>Prioritize similar high-value customers for upcoming festive intervals.</li>
              <li>Recommend personalized offers for festive staple buyers.</li>
              <li>Avoid generic "We miss you" messages — specific product mentions drive 2.4× higher return rates.</li>
            </ul>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('aaj')}
              className="flex-1 py-3 bg-paytm-blue hover:bg-blue-600 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-md transition"
            >
              Back to Aaj Home Feed
            </button>
            <button
              onClick={() => setIsWhatsAppModalOpen(true)}
              className="px-4 py-3 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-2xl font-bold text-xs hover:bg-emerald-100 transition"
            >
              Open WhatsApp Simulator
            </button>
          </div>

        </div>
      )}

      {/* Screen 9: WhatsApp Interactive Customer View Simulator */}
      <WhatsAppSimulatorModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        customerName={activeCustomer.name}
        includeDiscount={includeDiscount}
      />

      {/* Evidence & Impact Modal */}
      <EvidenceModal
        isOpen={showEvidence}
        onClose={() => setShowEvidence(false)}
        actionData={{
          type: "CUSTOMER",
          action_type: "CAMPAIGN_BROADCAST",
          headline: "WhatsApp Win-back Offer to 12 Lapsed Customers",
          why: "12 high-value customers haven't returned in 60 days. Historical spend: ₹18,000."
        }}
      />

    </div>
  );
}
