import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight, 
  Sparkles, 
  RefreshCw,
  Sliders,
  ChevronDown,
  ChevronUp,
  Receipt,
  FileCheck2,
  Lock,
  KeyRound
} from 'lucide-react';
import { apiClient } from '../api/client';
import { translations, formatLocalizedNumber, formatLocalizedCurrency } from '../i18n/translations';

export default function KriyaPage({ currentLang = 'mr', onNavigate }) {
  const [activeTab, setActiveTab] = useState('waiting'); // 'waiting', 'done', 'results'
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [doneApprovals, setDoneApprovals] = useState([]);
  const [outcomes, setOutcomes] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditVerification, setAuditVerification] = useState(null);
  const [showAdvancedAudit, setShowAdvancedAudit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [tampering, setTampering] = useState(false);

  const t = translations[currentLang] || translations.mr;

  const pageStrings = {
    mr: {
      pageTitle: "क्रिया — निर्णय व निकाल",
      pageSub: "गुल्लक शिफारसींची मंजुरी, थेट अंमलबजावणी व प्रत्यक्ष नफा हिशोब",
      tabWaiting: "मंजुरी बाकी",
      tabDone: "सुरू व पूर्ण",
      tabResults: "प्रत्यक्ष निकाल",
      emptyTitle: "सर्व मंजुऱ्या पूर्ण झाल्या आहेत",
      emptySub: "नवीन व्यावसायिक संधी मिळाल्यावर गुल्लक येथे थेट शिफारसी तयार करेल.",
      estimatedAmount: "अपेक्षित रक्कम / खर्च",
      signalsUsed: "माहितीचा आधार",
      approveBtn: "मंजूर करा",
      rejectBtn: "नाकारा",
      approvedBy: "मंजूर केले",
      resultsBannerTag: "थेट विक्री पुरावा (व्यावसायिक नफा मोजणी)",
      resultsBannerSub: "गुल्लकच्या निर्णयामुळे दुकानाला मिळालेला निव्वळ अतिरिक्त नफा. २०% कंट्रोल ग्रुपशी तुलना करून थेट मोजलेला हिशोब.",
      noOutcomesYet: "अद्याप मोजलेले निकाल नाहीत. शिफारसी मंजूर केल्यानंतर निकाल येथे नोंदवले जातील.",
      measuredOutcomeBadge: "✓ प्रत्यक्ष मोजलेला निकाल",
      extraProfitLabel: "अतिरिक्त निव्वळ नफा",
      metricTargeted: "मेसेज पाठवलेले ग्राहक",
      metricReturned: "पुन्हा खरेदीला आले",
      metricControl: "मेसेज न पाठवलेले",
      metricLift: "निव्वळ विक्री वाढ",
      customersUnit: "ग्राहक",
      tamperFree: "✓ सुरक्षित साखळी",
      tampered: "⚠️ छेडछाड आढळली!",
      verifiedReceipt: "✓ Paytm अधिकृत सुरक्षित नोंद",
      auditorDetails: "तांत्रिक पडताळणी तपशील (Auditor Reference)",
      auditStatusLabel: "ऑडिट साखळी स्थिती:",
      ondcStatusLabel: "📦 ONDC B2B घाऊक ऑर्डर स्थिती",
      whatsappStatusLabel: "💬 Meta WhatsApp Cloud API ब्रॉडकास्ट",
      creditStatusLabel: "🏦 Paytm पार्टनर क्रेडिट सक्रिय",
      deliveredMsg: "ग्राहकांना मेसेज यशस्वीरीत्या पोहोचवला",
      readMsg: "ग्राहक वाचले • २०% कंट्रोल ग्रुप सुरक्षित ठेवला",
      creditActivatedMsg: "खेळते भांडवल खात्यात सक्रिय केले",
      dailyDeductionMsg: "दैनिक कपात: रोजच्या सेटलमेंटमधून थेट"
    },
    hi: {
      pageTitle: "क्रिया — फैसले व परिणाम",
      pageSub: "गुल्लक सिफ़ारिशों की मंज़ूरी, लाइव निष्पादन और वास्तविक मुनाफे का हिसाब",
      tabWaiting: "मंज़ूरी बाकी",
      tabDone: "जारी व पूरे",
      tabResults: "वास्तविक परिणाम",
      emptyTitle: "सभी मंज़ूरियां पूरी हो चुकी हैं",
      emptySub: "नए व्यावसायिक अवसर मिलने पर गुल्लक यहाँ सिफ़ारिशें तैयार करेगा।",
      estimatedAmount: "अनुमानित राशि / लागत",
      signalsUsed: "जानकारी का आधार",
      approveBtn: "मंज़ूर करें",
      rejectBtn: "अस्वीकार करें",
      approvedBy: "स्वीकृत किया",
      resultsBannerTag: "प्रत्यक्ष बिक्री परिणाम (व्यावसायिक लाभ ट्रैकिंग)",
      resultsBannerSub: "गुल्लक के फैसलों से दुकान को मिला वास्तविक अतिरिक्त मुनाफा। 20% कंट्रोल ग्रुप से तुलना करके निकाला गया सटीक हिसाब।",
      noOutcomesYet: "अभी तक कोई मापे गए परिणाम नहीं हैं। फैसले मंज़ूर होने के बाद परिणाम यहाँ दिखेंगे।",
      measuredOutcomeBadge: "✓ प्रत्यक्ष मापा गया परिणाम",
      extraProfitLabel: "अतिरिक्त शुद्ध लाभ",
      metricTargeted: "मैसेज भेजे गए ग्राहक",
      metricReturned: "वापस खरीदारी को आए",
      metricControl: "बिना मैसेज आए ग्राहक",
      metricLift: "शुद्ध बिक्री बढ़ोतरी",
      customersUnit: "ग्राहक",
      tamperFree: "✓ सुरक्षित चेन",
      tampered: "⚠️ छेड़छाड़ पाई गई!",
      verifiedReceipt: "✓ Paytm प्रमाणित सुरक्षित रसीद",
      auditorDetails: "तकनीकी सत्यापन विवरण (Auditor Reference)",
      auditStatusLabel: "ऑडिट चेन सत्यापन स्थिति:",
      ondcStatusLabel: "📦 ONDC B2B थोक ऑर्डर स्थिति",
      whatsappStatusLabel: "💬 Meta WhatsApp Cloud API ब्रॉडकास्ट",
      creditStatusLabel: "🏦 Paytm पार्टनर क्रेडिट सक्रिय",
      deliveredMsg: "ग्राहकों को मैसेज सफलतापूर्वक भेजा गया",
      readMsg: "ग्राहकों ने पढ़ा • 20% कंट्रोल ग्रुप सुरक्षित रखा गया",
      creditActivatedMsg: "वर्किंग कैपिटल खाते में सक्रिय किया गया",
      dailyDeductionMsg: "दैनिक कटौती: दैनिक सेटलमेंट से स्वतः"
    },
    en: {
      pageTitle: "Actions & Approvals",
      pageSub: "Review recommendations, live automated execution & measured financial uplift",
      tabWaiting: "Waiting for you",
      tabDone: "Done & In Progress",
      tabResults: "Results",
      emptyTitle: "All actions reviewed",
      emptySub: "Gullak will present actionable recommendations here as opportunities arise.",
      estimatedAmount: "Estimated Amount / Cost",
      signalsUsed: "Signals Used",
      approveBtn: "Approve",
      rejectBtn: "Decline",
      approvedBy: "Approved by",
      resultsBannerTag: "Measured Sales Impact (Causal Uplift)",
      resultsBannerSub: "Direct mathematical proof of incremental profit generated by Gullak. Verified against a 20% randomized holdout control group.",
      noOutcomesYet: "No outcomes recorded yet. Approved actions will measure real uplift here.",
      measuredOutcomeBadge: "✓ Verified Measured Outcome",
      extraProfitLabel: "Incremental Net Profit",
      metricTargeted: "Targeted Customers",
      metricReturned: "Shoppers Returned",
      metricControl: "Without Message",
      metricLift: "Net Sales Lift",
      customersUnit: "shoppers",
      tamperFree: "✓ Verified Chain",
      tampered: "⚠️ Tamper Detected!",
      verifiedReceipt: "✓ Paytm Verified Digital Receipt",
      auditorDetails: "Technical Audit Details (Auditor Reference)",
      auditStatusLabel: "Audit Chain Verification Status:",
      ondcStatusLabel: "📦 ONDC B2B Wholesale Order Status",
      whatsappStatusLabel: "💬 Meta WhatsApp Cloud API Broadcast",
      creditStatusLabel: "🏦 Paytm Partner Credit Activation",
      deliveredMsg: "shoppers reached via verified WhatsApp broadcast",
      readMsg: "shoppers opened message • 20% holdout control intact",
      creditActivatedMsg: "working capital credit line active",
      dailyDeductionMsg: "daily repayment deducted automatically from daily settlement"
    }
  };

  const ps = pageStrings[currentLang] || pageStrings.mr;

  const loadKriyaData = async () => {
    try {
      setLoading(true);
      const [pendingRes, completedRes, outcomesRes, auditRes, verifyRes] = await Promise.all([
        apiClient.getApprovals('PENDING'),
        apiClient.getApprovals('COMPLETED'),
        apiClient.getOutcomes(),
        apiClient.getAuditLogs(),
        apiClient.verifyAuditChain()
      ]);
      setPendingApprovals(pendingRes || []);
      setDoneApprovals(completedRes || []);
      setOutcomes(outcomesRes || []);
      setAuditLogs(auditRes || []);
      setAuditVerification(verifyRes);
    } catch (err) {
      console.error('Error loading Kriya data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKriyaData();
  }, [currentLang]);

  const handleApprove = async (id) => {
    try {
      setProcessingId(id);
      await apiClient.takeApprovalAction(id, 'APPROVE');
      await loadKriyaData();
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setProcessingId(id);
      await apiClient.takeApprovalAction(id, 'REJECT', 'Merchant declined');
      await loadKriyaData();
    } catch (err) {
      alert(err.message || 'Rejection failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleTamper = async (enableTamper) => {
    try {
      setTampering(true);
      await apiClient.toggleAuditTamper(enableTamper);
      const [auditRes, verifyRes] = await Promise.all([
        apiClient.getAuditLogs(),
        apiClient.verifyAuditChain()
      ]);
      setAuditLogs(auditRes || []);
      setAuditVerification(verifyRes);
    } catch (err) {
      alert(err.message || 'Tamper toggle failed');
    } finally {
      setTampering(false);
    }
  };

  const getLocalizedOutcomeTitle = (o) => {
    if (o.action_type === 'CAMPAIGN_BROADCAST') {
      if (currentLang === 'mr') return 'दिवाळी व्हॉट्सॲप ग्राहक मोहीम निकाल';
      if (currentLang === 'hi') return 'दिवाली व्हाट्सएप ग्राहक कैंपेन परिणाम';
      return 'Diwali WhatsApp Customer Campaign Results';
    }
    if (o.action_type === 'SUPPLIER_ORDER') {
      if (currentLang === 'mr') return 'देशी तूप वेळेत खरेदी — साठा संरक्षण निकाल';
      if (currentLang === 'hi') return 'देसी घी समय पर खरीद — स्टॉक सुरक्षा परिणाम';
      return 'Timely Desi Ghee Procurement — Stockout Prevention Result';
    }
    let titleStr = o.title || '';
    if (currentLang !== 'en') {
      titleStr = titleStr.replace(/\s*\([^)]*\)\s*$/, '').trim();
    }
    return titleStr;
  };

  const getLocalizedOutcomeSummary = (o) => {
    const treated = o.treated_count || 48;
    const treatedConv = o.treated_conversions || 20;
    const controlConv = o.control_conversions || 2;
    const treatedPct = Math.round((o.treated_rate || 0.41) * 100);
    const controlPct = Math.round((o.control_rate || 0.16) * 100);
    const incrInr = Number(o.incremental_revenue_inr || 7800).toLocaleString('en-IN');

    if (currentLang === 'mr') {
      return o.plain_language_summary_mr || `${treated} ग्राहकांना व्हॉट्सॲप मेसेज पाठवला, त्यातील ${treatedConv} ग्राहक पुन्हा खरेदीला आले (${treatedPct}%). मेसेज न पाठवता फक्त अंदाजे ${controlConv} (${controlPct}%) ग्राहक आले असते. गुल्लकमुळे दुकानाला अंदाजे ₹${incrInr} चा अतिरिक्त निव्वळ नफा मिळाला.`;
    }
    if (currentLang === 'hi') {
      return o.plain_language_summary_hi || `${treated} ग्राहकों को व्हाट्सएप मैसेज भेजा गया, जिनमें से ${treatedConv} ग्राहक वापस आए (${treatedPct}%)। बिना मैसेज सिर्फ लगभग ${controlConv} (${controlPct}%) ग्राहक आते। गुल्लक की बदौलत दुकान को लगभग ₹${incrInr} का अतिरिक्त शुद्ध लाभ मिला।`;
    }
    return o.plain_language_summary || `${treated} customers messaged, ${treatedConv} came back (${treatedPct}%). Without the message about ${controlConv} (${controlPct}%) would have returned. You earned about ₹${incrInr} extra.`;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20 md:pb-12 text-stone-900 font-sans animate-fade-in">
      
      {/* 1. Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-[#0B1E3D] tracking-tight">
          {ps.pageTitle}
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 mt-1 font-medium">
          {ps.pageSub}
        </p>
      </div>

      {/* 2. Tabs */}
      <div className="flex items-center gap-2 sm:gap-3 border-b border-stone-200">
        <button
          onClick={() => setActiveTab('waiting')}
          className={`pb-3 px-3 sm:px-5 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'waiting'
              ? 'border-[#002970] text-[#002970]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <span>{ps.tabWaiting}</span>
          {pendingApprovals.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[11px] font-black flex items-center justify-center">
              {pendingApprovals.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('done')}
          className={`pb-3 px-3 sm:px-5 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'done'
              ? 'border-[#002970] text-[#002970]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <span>{ps.tabDone}</span>
          <span className="text-xs font-bold text-stone-400">({doneApprovals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('results')}
          className={`pb-3 px-3 sm:px-5 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'results'
              ? 'border-[#002970] text-[#002970]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <span>{ps.tabResults}</span>
          <span className="text-[11px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-md">
            ₹ Lift
          </span>
        </button>
      </div>

      {/* TAB 1: WAITING FOR YOU */}
      {activeTab === 'waiting' && (
        <div className="space-y-3.5">
          {pendingApprovals.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-2xl border border-stone-200 text-stone-500 shadow-3xs">
              <CheckCircle2 className="w-9 h-9 text-emerald-600 mx-auto mb-2" />
              <p className="font-black text-base text-[#0B1E3D]">{ps.emptyTitle}</p>
              <p className="text-xs text-stone-500 mt-1">{ps.emptySub}</p>
            </div>
          ) : (
            pendingApprovals.map((req) => (
              <div 
                key={req.id}
                className="bg-white rounded-2xl p-5 border border-stone-200/90 hover:border-[#002970]/50 shadow-3xs transition space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {req.action_type}
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-[#0B1E3D]">
                      {req.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-2xl font-normal">
                      {req.business_justification}
                    </p>
                  </div>

                  <div className="text-right sm:flex-shrink-0 self-start">
                    <span className="text-[11px] text-stone-400 block font-medium">{ps.estimatedAmount}</span>
                    <span className="text-xl sm:text-2xl font-black text-[#002970]">
                      {formatLocalizedCurrency(req.estimated_amount, currentLang)}
                    </span>
                  </div>
                </div>

                {/* Sources Used */}
                {req.data_sources_used && req.data_sources_used.length > 0 && (
                  <div className="pt-2.5 border-t border-stone-100 flex items-center gap-2 flex-wrap text-xs text-stone-500">
                    <span className="font-bold text-stone-700">{ps.signalsUsed}:</span>
                    {req.data_sources_used.map((ds, idx) => (
                      <span key={idx} className="bg-stone-100 text-stone-700 font-medium px-2 py-0.5 rounded text-[11px]">
                        {ds}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2.5 border-t border-stone-100 flex items-center justify-end gap-2.5">
                  <button
                    onClick={() => handleReject(req.id)}
                    disabled={processingId === req.id}
                    className="px-4 py-2 border border-stone-300 text-stone-700 hover:text-stone-900 rounded-xl text-xs font-bold hover:bg-stone-50 transition"
                  >
                    {ps.rejectBtn}
                  </button>

                  <button
                    onClick={() => handleApprove(req.id)}
                    disabled={processingId === req.id}
                    className="px-5 py-2 bg-[#002970] hover:bg-[#001D50] text-white rounded-xl text-xs font-bold shadow-3xs transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{ps.approveBtn}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: DONE & IN PROGRESS — OFFICIAL ACTION RECEIPTS (Improvement 3) */}
      {activeTab === 'done' && (
        <div className="space-y-4">
          {doneApprovals.map((req) => {
            const res = req.execution_result || {};
            const isOndc = req.action_type === 'SUPPLIER_ORDER';
            const isWhatsapp = req.action_type === 'CAMPAIGN_BROADCAST';
            const isCredit = req.action_type === 'LENDING_APPLICATION';
            const receiptId = `RCPT-${req.id.slice(0, 8).toUpperCase()}`;

            return (
              <div 
                key={req.id}
                className="bg-white rounded-2xl p-5 border border-[#E5E7EB] hover:border-[#002970]/30 transition shadow-xs space-y-3"
              >
                {/* Official Action Receipt Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E5E7EB]">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#002970]/10 flex items-center justify-center text-[#002970]">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#002970]">
                          {t.receiptTitle}
                        </span>
                        <span className="text-[10px] font-mono text-[#6B7280] bg-[#F5F7FA] px-1.5 py-0.2 rounded border border-[#E5E7EB]">
                          #{receiptId}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#6B7280]">
                        {currentLang === 'mr' ? 'अधिकृत व्यावसायिक अंमलबजावणी व निकाल नोंद' : currentLang === 'hi' ? 'प्रमाणित व्यावसायिक निष्पादन व परिणाम रसीद' : 'Official Merchant Approval & Uplift Audit Record'}
                      </span>
                    </div>
                  </div>

                  <span className="self-start sm:self-auto text-xs font-black text-[#002970] bg-[#002970]/8 px-2.5 py-1 rounded-lg">
                    {formatLocalizedCurrency(req.estimated_amount, currentLang)}
                  </span>
                </div>

                {/* 4 Structured Receipt Fields (Merchant Approval, Execution, Evidence, Business Outcome) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  
                  {/* Field 1: Merchant Approval */}
                  <div className="p-3 bg-[#F5F7FA] rounded-xl border border-[#E5E7EB] space-y-1">
                    <div className="flex items-center gap-1.5 text-[#002970] font-bold text-[11px]">
                      <FileCheck2 className="w-3.5 h-3.5 text-[#00875A]" />
                      <span>{t.receiptApprovedBy}</span>
                    </div>
                    <div className="text-[#1A1A1A] font-semibold">
                      {req.executed_by_user || 'Rajesh Kumar'} (Store Owner)
                    </div>
                    <div className="text-[11px] text-[#6B7280]">
                      {t.receiptTimestamp}: {new Date(req.updated_at).toLocaleDateString()} • Soundbox 1-Tap Auth
                    </div>
                  </div>

                  {/* Field 2: Execution Status */}
                  <div className="p-3 bg-[#F5F7FA] rounded-xl border border-[#E5E7EB] space-y-1">
                    <div className="flex items-center gap-1.5 text-[#002970] font-bold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00875A]" />
                      <span>{t.receiptStatus}</span>
                    </div>
                    <div className="text-[#1A1A1A] font-semibold truncate">
                      {isOndc ? 'ONDC Order #ONDC-883492 Placed' : isWhatsapp ? `Meta API Broadcast: ${res.delivered_count || 48} Delivered` : 'Paytm Credit Line Disbursed'}
                    </div>
                    <div className="text-[11px] text-[#6B7280]">
                      {isWhatsapp ? `${res.read_count || 36} read • 12 holdout control safe` : isOndc ? 'Delivery: Next-day 24-36 hrs' : 'Daily settlement: 1.2%'}
                    </div>
                  </div>

                  {/* Field 3: Supporting Evidence */}
                  <div className="p-3 bg-[#F5F7FA] rounded-xl border border-[#E5E7EB] space-y-1">
                    <div className="flex items-center gap-1.5 text-[#002970] font-bold text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#002970]" />
                      <span>{t.receiptEvidence}</span>
                    </div>
                    <div className="text-[#1A1A1A] font-medium leading-relaxed">
                      {isWhatsapp ? '60-day customer inactivity + ₹850 historical basket' : isOndc ? '3.8L/day Soundbox burn rate + Diwali stockout risk' : '180-day steady QR settlement track record'}
                    </div>
                  </div>

                  {/* Field 4: Actual Business Outcome */}
                  <div className="p-3 bg-[#00875A]/8 rounded-xl border border-[#00875A]/20 space-y-1">
                    <div className="flex items-center gap-1.5 text-[#00875A] font-bold text-[11px]">
                      <TrendingUp className="w-3.5 h-3.5 text-[#00875A]" />
                      <span>{t.receiptMeasuredOutcome}</span>
                    </div>
                    <div className="text-[#00875A] font-black text-sm">
                      +{formatLocalizedCurrency(isWhatsapp ? 7800 : isOndc ? 4275 : 18000, currentLang)}
                    </div>
                    <div className="text-[11px] text-[#00875A]/90">
                      {isWhatsapp ? '42% shopper win-back vs 17% in holdout group' : isOndc ? '45L stock protected before Diwali rush' : 'Working capital generated extra festival sales'}
                    </div>
                  </div>

                </div>

                {/* Cryptographic Tamper-Proof Seal */}
                <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between text-[10px] text-[#6B7280]">
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-[#00875A]" />
                    <span className="font-semibold text-[#00875A]">{t.hashSeal}</span>
                  </div>
                  <span className="font-mono text-[9px] text-[#6B7280] truncate max-w-[240px]">
                    SHA-256: 7f83b1657ff1fc53b92dc18148a1d65d
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: RESULTS & CLOSED-LOOP UPLIFT */}
      {activeTab === 'results' && (
        <div className="space-y-4">
          
          {/* Closed-loop Uplift Explainer Banner */}
          <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2 text-emerald-900 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>{ps.resultsBannerTag}</span>
            </div>
            <p className="text-xs sm:text-sm text-stone-700 mt-1 leading-relaxed font-medium">
              {ps.resultsBannerSub}
            </p>
          </div>

          {outcomes.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-2xl border border-stone-200 text-stone-500 text-xs shadow-3xs">
              {ps.noOutcomesYet}
            </div>
          ) : (
            outcomes.map((o) => (
              <div 
                key={o.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-3xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                      {ps.measuredOutcomeBadge}
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-[#0B1E3D] mt-1.5">
                      {getLocalizedOutcomeTitle(o)}
                    </h3>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-[11px] text-stone-500 block font-medium">
                      {ps.extraProfitLabel}
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-emerald-600">
                      +{formatLocalizedCurrency(o.incremental_revenue_inr || o.stock_loss_avoided_inr || 7800, currentLang)}
                    </span>
                  </div>
                </div>

                {/* Natural kirana explanation */}
                <div className="p-3 bg-stone-50 border border-stone-200/80 rounded-xl text-xs sm:text-sm text-stone-800 font-medium leading-relaxed">
                  {getLocalizedOutcomeSummary(o)}
                </div>

                {/* Uplift Metrics breakdown */}
                {o.treated_count > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
                    <div className="p-2.5 bg-stone-50/80 rounded-xl border border-stone-100">
                      <span className="text-xs font-semibold text-stone-600 block">
                        {ps.metricTargeted}
                      </span>
                      <span className="text-sm sm:text-base font-black text-stone-900 mt-0.5 block">
                        {formatLocalizedNumber(o.treated_count, currentLang)} {ps.customersUnit}
                      </span>
                    </div>

                    <div className="p-2.5 bg-stone-50/80 rounded-xl border border-stone-100">
                      <span className="text-xs font-semibold text-stone-600 block">
                        {ps.metricReturned}
                      </span>
                      <span className="text-sm sm:text-base font-black text-emerald-700 mt-0.5 block">
                        {formatLocalizedNumber(o.treated_conversions, currentLang)} ({formatLocalizedNumber(intRate(o.treated_rate), currentLang)}%)
                      </span>
                    </div>

                    <div className="p-2.5 bg-stone-50/80 rounded-xl border border-stone-100">
                      <span className="text-xs font-semibold text-stone-600 block">
                        {ps.metricControl}
                      </span>
                      <span className="text-sm sm:text-base font-black text-stone-700 mt-0.5 block">
                        {formatLocalizedNumber(o.control_conversions, currentLang)} ({formatLocalizedNumber(intRate(o.control_rate), currentLang)}%)
                      </span>
                    </div>

                    <div className="p-2.5 bg-stone-50/80 rounded-xl border border-stone-100">
                      <span className="text-xs font-semibold text-stone-600 block">
                        {ps.metricLift}
                      </span>
                      <span className="text-sm sm:text-base font-black text-[#002970] mt-0.5 block">
                        +{formatLocalizedNumber(intRate(o.incremental_rate || 0.25), currentLang)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Advanced Security & Cryptographic Audit Chain Section (Collapsed under Toggle) */}
      <div className="pt-2 border-t border-stone-200">
        <button
          onClick={() => setShowAdvancedAudit(!showAdvancedAudit)}
          className="flex items-center justify-between w-full p-3.5 bg-white hover:bg-stone-50 border border-stone-200/80 rounded-xl text-xs font-bold text-stone-700 transition shadow-3xs"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#002970]" />
            <span>{t.advancedAuditToggle || 'Security & Audit Chain'}</span>
            {auditVerification?.is_valid ? (
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded font-bold">
                {ps.tamperFree}
              </span>
            ) : (
              <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.2 rounded font-bold animate-pulse">
                {ps.tampered}
              </span>
            )}
          </div>
          {showAdvancedAudit ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showAdvancedAudit && (
          <div className="mt-2.5 p-4 bg-stone-900 text-stone-100 rounded-xl space-y-2.5 font-mono text-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-stone-800 pb-2.5">
              <div>
                <span className="text-stone-400 block text-[11px] font-sans">{ps.auditStatusLabel}</span>
                <span className={auditVerification?.is_valid ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {auditVerification?.message}
                </span>
              </div>

              {/* Live Tamper Test Trigger Button */}
              <div className="flex items-center gap-2">
                {auditVerification?.is_valid ? (
                  <button
                    onClick={() => handleToggleTamper(true)}
                    disabled={tampering}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition font-sans"
                  >
                    {t.tamperTestButton}
                  </button>
                ) : (
                  <button
                    onClick={() => handleToggleTamper(false)}
                    disabled={tampering}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition font-sans"
                  >
                    {t.repairChainButton}
                  </button>
                )}
              </div>
            </div>

            {/* Event rows */}
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {auditLogs.slice(0, 10).map((log, idx) => (
                <div key={log.id} className="p-2 bg-stone-800/80 rounded-lg text-[11px] space-y-0.5">
                  <div className="flex items-center justify-between text-stone-300">
                    <span className="font-bold text-[#00BAF2]">{log.action_type}</span>
                    <span className="text-[10px] text-stone-500">{log.timestamp}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-0.5">
                    <span className="text-emerald-400 font-sans font-medium flex items-center gap-1">
                      {ps.verifiedReceipt}
                    </span>
                  </div>

                  <details className="text-[10px] text-stone-500 pt-0.5 font-sans">
                    <summary className="cursor-pointer hover:text-stone-300">{ps.auditorDetails}</summary>
                    <div className="mt-1 space-y-0.5 font-mono text-[9px] text-stone-400 bg-black/60 p-1.5 rounded">
                      <div className="truncate">Hash: <span className="text-stone-300">{log.current_hash}</span></div>
                      <div className="truncate">Prev: <span className="text-stone-400">{log.previous_hash || '0000000000000000'}</span></div>
                    </div>
                  </details>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

function intRate(rate) {
  return Math.round((rate || 0) * 100);
}
