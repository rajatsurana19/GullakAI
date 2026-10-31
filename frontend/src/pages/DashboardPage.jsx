import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Calendar,
  AlertTriangle,
  Users,
  Package,
  ChevronRight,
  Info,
  Radio,
  Play,
  Share2,
  X,
  ShieldAlert,
  BrainCircuit,
  Activity,
  History,
  Compass
} from 'lucide-react';
import { apiClient } from '../api/client';
import { translations, formatLocalizedNumber, formatLocalizedCurrency } from '../i18n/translations';
import EvidenceModal from '../components/modals/EvidenceModal';
import WhatsAppSimulatorModal from '../components/chat/WhatsAppSimulatorModal';

export default function DashboardPage({ 
  merchant, 
  onNavigate, 
  onOpenVoice, 
  onOpenSoundbox, 
  currentLang = 'mr' 
}) {
  const [data, setData] = useState(null);
  const [topActions, setTopActions] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actingActionId, setActingActionId] = useState(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState(null);
  
  // Modals state
  const [selectedEvidenceAction, setSelectedEvidenceAction] = useState(null);
  const [selectedCreditAction, setSelectedCreditAction] = useState(null);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [error, setError] = useState(null);

  const t = translations[currentLang] || translations.mr;

  const loadAajFeed = async () => {
    try {
      setLoading(true);
      setError(null);
      const [summaryRes, actionsRes, earningsRes] = await Promise.all([
        apiClient.getDashboardSummary(currentLang).catch(() => null),
        apiClient.getTop3Actions(currentLang).catch(() => []),
        apiClient.getEarnings().catch(() => null)
      ]);
      setData(summaryRes);
      setTopActions(actionsRes && actionsRes.length > 0 ? actionsRes : [
        {
          id: "stock_ghee_alert",
          type: "STOCK",
          headline: t.priority1Title,
          why: t.priority1Desc,
          expected_impact_inr: 28500,
          confidence: "High",
          signals_used: ["4-Day Ghee Stockout Risk", "Diwali In 9 Days", "ONDC 2-Day Delivery"]
        },
        {
          id: "cust_lapsed_60",
          type: "CUSTOMER",
          headline: t.priority2Title,
          why: t.priority2Desc,
          expected_impact_inr: 12000,
          confidence: "High",
          signals_used: ["30+ Day Inactive Window", "₹850 Historical Basket", "WhatsApp 1-Tap Delivery"]
        },
        {
          id: "wc_credit_line",
          type: "CAPITAL",
          headline: t.priority3Title,
          why: t.priority3Desc,
          expected_impact_inr: 50000,
          confidence: "Medium",
          signals_used: ["180-Day Soundbox History", "1.2% Daily Deduction", "Zero Collateral"]
        }
      ]);
      setEarnings(earningsRes);
    } catch (err) {
      setError(err.message || 'Unable to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAajFeed();
  }, [currentLang]);

  const handleApproveAction = async (action, e) => {
    if (e) e.stopPropagation();
    try {
      setActingActionId(action.id);
      if (action.approval_id) {
        await apiClient.takeApprovalAction(action.approval_id, 'APPROVE');
      }
      setActionSuccessMsg(
        currentLang === 'mr' 
          ? `✓ '${action.headline}' मंजूर झाले व अंमलबजावणी सुरू झाली!` 
          : currentLang === 'hi'
          ? `✓ '${action.headline}' स्वीकृत किया गया!`
          : `✓ '${action.headline}' approved and scheduled!`
      );
      setTimeout(() => {
        loadAajFeed();
        setActionSuccessMsg(null);
      }, 1800);
    } catch (err) {
      setActionSuccessMsg(`✓ '${action.headline}' approved!`);
      setTimeout(() => setActionSuccessMsg(null), 2000);
    } finally {
      setActingActionId(null);
    }
  };

  const handleOpenEvidence = (action, e) => {
    e.stopPropagation();
    setSelectedEvidenceAction(action);
  };

  // Clean store name without duplicate location suffixes
  const storeName = merchant?.business_name 
    ? merchant.business_name.replace(/,?\s*(Dadar|Mumbai|Maharashtra).*$/i, '').trim()
    : 'Shree Sai Kirana & Sweets';

  return (
    <div className="space-y-5 max-w-6xl mx-auto pb-16 font-sans text-[#1A1A1A]">
      
      {/* 1. Compact Professional Merchant Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
              {t.goodMorning},
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-[#E99A00]/10 text-[#B87A00] border border-[#E99A00]/25">
              <Calendar className="w-3 h-3" />
              <span>{t.diwaliCountdown}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#071E46] tracking-tight">
            {merchant?.contact_name || 'Rajesh Kumar'}
          </h1>

          <div className="flex items-center gap-2 mt-0.5 text-xs text-[#6B7280] flex-wrap">
            <span className="font-semibold text-[#1A1A1A]">
              {storeName}
            </span>
            <span>·</span>
            <span>{t.storeLocation}</span>
            <span>·</span>
            <span className="italic text-[#6B7280]">"{t.merchantMotto}"</span>
          </div>
        </div>

        {/* Paytm Soundbox Status Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onOpenSoundbox}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E5E7EB] text-xs font-semibold text-[#1A1A1A] hover:bg-[#F5F7FA] transition"
          >
            <Radio className="w-3.5 h-3.5 text-[#00875A]" />
            <span>{t.soundboxActive}</span>
          </button>
        </div>
      </div>

      {/* Success Notification Bar */}
      {actionSuccessMsg && (
        <div className="p-3 bg-[#00875A]/10 border border-[#00875A]/25 text-[#00875A] rounded-lg text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#00875A] flex-shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* 2. Top Financial Summary (4 Aligned White Metric Panels with Localized Numbers) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Today's Sales */}
        <div className="min-w-0 bg-white p-4 rounded-xl border border-[#E5E7EB] hover:border-[#002970]/30 transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#6B7280] mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider truncate">
                {t.todaysSalesTitle}
              </span>
              <span className="text-[10px] font-bold text-[#00875A] bg-[#00875A]/10 px-1.5 py-0.2 rounded border border-[#00875A]/20 flex-shrink-0">
                {t.todaysSalesGrowth}
              </span>
            </div>
            <div className="text-2xl font-black text-[#071E46] tracking-tight tabular-nums">
              {formatLocalizedCurrency(data?.today_revenue || 74036, currentLang)}
            </div>
          </div>
          <div className="text-[11px] text-[#6B7280] mt-2 truncate">
            {t.todaysSalesDetail}
          </div>
        </div>

        {/* Expected Settlement */}
        <div className="min-w-0 bg-white p-4 rounded-xl border border-[#E5E7EB] hover:border-[#002970]/30 transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#6B7280] mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider truncate">
                {t.tomorrowDepositTitle}
              </span>
              <span className="text-[10px] text-[#6B7280] font-mono flex-shrink-0">
                {t.tomorrowDepositTime}
              </span>
            </div>
            <div className="text-2xl font-black text-[#002970] tracking-tight tabular-nums">
              {formatLocalizedCurrency(data?.pending_settlement_amount || 49147, currentLang)}
            </div>
          </div>
          <div className="text-[11px] text-[#6B7280] mt-2 truncate">
            {t.tomorrowDepositDetail}
          </div>
        </div>

        {/* Cash Position */}
        <div className="min-w-0 bg-white p-4 rounded-xl border border-[#E5E7EB] hover:border-[#002970]/30 transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#6B7280] mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider truncate">
                {t.cashPositionTitle}
              </span>
              <span className="text-[10px] text-[#6B7280] font-medium flex-shrink-0">
                {t.cashPositionStatus}
              </span>
            </div>
            <div className="text-2xl font-black text-[#1A1A1A] tracking-tight tabular-nums">
              {formatLocalizedCurrency(24889, currentLang)}
            </div>
          </div>
          <div className="text-[11px] text-[#6B7280] mt-2 truncate">
            {t.cashPositionDetail}
          </div>
        </div>

        {/* Gullak Impact */}
        <div className="min-w-0 bg-white p-4 rounded-xl border border-[#E5E7EB] hover:border-[#002970]/30 transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#6B7280] mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#00875A] truncate">
                {t.gullakImpactTitle}
              </span>
              <span className="text-[10px] text-[#00875A] font-bold bg-[#00875A]/10 px-1.5 py-0.2 rounded border border-[#00875A]/20 flex-shrink-0">
                {t.gullakImpactStatus}
              </span>
            </div>
            <div className="text-2xl font-black text-[#00875A] tracking-tight tabular-nums">
              +{formatLocalizedCurrency(earnings?.measured_revenue_inr || 8245, currentLang)}
            </div>
          </div>
          <div className="text-[11px] text-[#6B7280] mt-2 truncate">
            {t.gullakImpactDetail}
          </div>
        </div>

      </div>

      {/* Improvement 1: Urgent Business Risk Indicator */}
      <div className="bg-white rounded-xl border-l-4 border-l-[#D92D20] border-y border-r border-[#E5E7EB] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#D92D20]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <ShieldAlert className="w-4 h-4 text-[#D92D20]" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#D92D20] uppercase tracking-wider">
                {t.businessRiskTitle}
              </span>
              <span className="text-[10px] font-bold text-[#D92D20] bg-[#D92D20]/10 px-1.5 py-0.2 rounded border border-[#D92D20]/20">
                {t.businessRiskBadge}
              </span>
            </div>
            <p className="text-xs text-[#1A1A1A] font-medium leading-relaxed max-w-2xl">
              {t.businessRiskIssue}
            </p>
            <div className="text-[11px] text-[#6B7280] font-semibold flex items-center gap-1.5 pt-0.5">
              <span>{t.businessRiskImpactLabel}</span>
              <span className="text-[#D92D20] font-black">{formatLocalizedCurrency(28500, currentLang)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigate('maal_paisa')}
          className="px-4 py-2 bg-[#D92D20] hover:bg-[#B42318] text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 flex-shrink-0 self-start md:self-center"
        >
          <span>{t.businessRiskActionBtn}</span>
        </button>
      </div>

      {/* Improvement 10: Premium Features Quick Status Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="bg-white p-2.5 rounded-lg border border-[#E5E7EB] flex items-center gap-2">
          <History className="w-4 h-4 text-[#002970] flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-[#6B7280] uppercase truncate">{t.businessMemory}</div>
            <div className="text-[11px] font-bold text-[#1A1A1A] truncate">{currentLang === 'mr' ? 'दिवाळी २०२५ खप स्मरणात' : currentLang === 'hi' ? 'दिवाली 2025 मांग सक्रिय' : 'Diwali 2025 Pattern Active'}</div>
          </div>
        </div>
        <div className="bg-white p-2.5 rounded-lg border border-[#E5E7EB] flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-[#00875A] flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-[#6B7280] uppercase truncate">{t.financialTwin}</div>
            <div className="text-[11px] font-bold text-[#1A1A1A] truncate">{currentLang === 'mr' ? '१४-दिवस रोख अंदाज' : currentLang === 'hi' ? '14-दिन कैश सिमुलेशन' : '14-Day Simulation'}</div>
          </div>
        </div>
        <div className="bg-white p-2.5 rounded-lg border border-[#E5E7EB] flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#E99A00] flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-[#6B7280] uppercase truncate">{t.businessRecoveryMode}</div>
            <div className="text-[11px] font-bold text-[#1A1A1A] truncate">{currentLang === 'mr' ? 'नफा संरक्षण सक्रिय' : currentLang === 'hi' ? 'प्रॉफिट सुरक्षा एक्टिव' : 'Margin Floor Active'}</div>
          </div>
        </div>
        <div className="bg-white p-2.5 rounded-lg border border-[#E5E7EB] flex items-center gap-2">
          <Compass className="w-4 h-4 text-[#002970] flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-[#6B7280] uppercase truncate">{t.neighborhoodIntelligence}</div>
            <div className="text-[11px] font-bold text-[#00875A] truncate">{currentLang === 'mr' ? '+३४% तूप मागणी कल' : currentLang === 'hi' ? '+34% घी मांग ट्रेंड' : '+34% Market Demand'}</div>
          </div>
        </div>
      </div>

      {/* 3. Main Workspace: Priorities + Right Column Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* Left Column (8 cols): Today's Priorities */}
        <div className="lg:col-span-8 space-y-3">
          
          <div className="flex items-center justify-between pb-0.5">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#071E46] tracking-tight">
                {t.prioritiesTitle}
              </h2>
              <p className="text-xs text-[#6B7280] mt-0.5">
                {t.prioritiesSub}
              </p>
            </div>
            <span className="text-[11px] font-bold text-[#6B7280] bg-[#F5F7FA] px-2 py-0.5 rounded border border-[#E5E7EB]">
              {t.activePrioritiesCount}
            </span>
          </div>

          {/* 3 Actionable Task Cards */}
          <div className="space-y-2.5">
            
            {/* Task 01: Restock Fast Moving Items */}
            <div 
              onClick={() => onNavigate('maal_paisa')}
              className="bg-white rounded-xl p-4 border border-[#E5E7EB] hover:border-[#002970]/40 transition cursor-pointer group space-y-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-[#002970] font-mono tracking-wider">
                      {currentLang === 'en' ? '01' : '०१'}
                    </span>
                    <h3 className="font-bold text-sm sm:text-base text-[#1A1A1A] group-hover:text-[#002970] transition">
                      {t.priority1Title}
                    </h3>
                    <span className="text-[10px] font-bold text-[#D92D20] bg-[#D92D20]/10 px-2 py-0.2 rounded border border-[#D92D20]/20">
                      {t.priority1Badge}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B7280] leading-relaxed max-w-xl">
                    {t.priority1Desc}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#6B7280] group-hover:text-[#002970] group-hover:translate-x-0.5 transition flex-shrink-0 mt-1" />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#E5E7EB] text-xs">
                <button
                  onClick={(e) => handleOpenEvidence(topActions[0], e)}
                  className="text-[#6B7280] hover:text-[#002970] font-medium flex items-center gap-1 transition"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>{t.priority1Why}</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate('maal_paisa');
                  }}
                  className="px-3.5 py-1.5 bg-[#002970] hover:bg-[#071E46] text-white rounded-md font-bold text-xs transition flex items-center gap-1"
                >
                  <span>{t.priority1Btn}</span>
                </button>
              </div>
            </div>

            {/* Task 02: Reach 60 Lapsed Regular Customers */}
            <div 
              onClick={() => setIsWhatsAppOpen(true)}
              className="bg-white rounded-xl p-4 border border-[#E5E7EB] hover:border-[#002970]/40 transition cursor-pointer group space-y-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-[#002970] font-mono tracking-wider">
                      {currentLang === 'en' ? '02' : '०२'}
                    </span>
                    <h3 className="font-bold text-sm sm:text-base text-[#1A1A1A] group-hover:text-[#002970] transition">
                      {t.priority2Title}
                    </h3>
                    <span className="text-[10px] font-bold text-[#00875A] bg-[#00875A]/10 px-2 py-0.2 rounded border border-[#00875A]/20">
                      {t.priority2Badge}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B7280] leading-relaxed max-w-xl">
                    {t.priority2Desc}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#6B7280] group-hover:text-[#002970] group-hover:translate-x-0.5 transition flex-shrink-0 mt-1" />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#E5E7EB] text-xs">
                <button
                  onClick={(e) => handleOpenEvidence(topActions[1], e)}
                  className="text-[#6B7280] hover:text-[#002970] font-medium flex items-center gap-1 transition"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>{t.priority2Why}</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsWhatsAppOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-[#002970] hover:bg-[#071E46] text-white rounded-md font-bold text-xs transition flex items-center gap-1"
                >
                  <span>{t.priority2Btn}</span>
                </button>
              </div>
            </div>

            {/* Task 03: Festival Working Capital Stock Opportunity */}
            <div 
              onClick={() => setSelectedCreditAction(topActions[2])}
              className="bg-white rounded-xl p-4 border border-[#E5E7EB] hover:border-[#002970]/40 transition cursor-pointer group space-y-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-[#002970] font-mono tracking-wider">
                      {currentLang === 'en' ? '03' : '०३'}
                    </span>
                    <h3 className="font-bold text-sm sm:text-base text-[#1A1A1A] group-hover:text-[#002970] transition">
                      {t.priority3Title}
                    </h3>
                    <span className="text-[10px] font-bold text-[#002970] bg-[#002970]/10 px-2 py-0.2 rounded border border-[#002970]/20">
                      {t.priority3Badge}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B7280] leading-relaxed max-w-xl">
                    {t.priority3Desc}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#6B7280] group-hover:text-[#002970] group-hover:translate-x-0.5 transition flex-shrink-0 mt-1" />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#E5E7EB] text-xs">
                <button
                  onClick={(e) => handleOpenEvidence(topActions[2], e)}
                  className="text-[#6B7280] hover:text-[#002970] font-medium flex items-center gap-1 transition"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>{t.priority3Why}</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCreditAction(topActions[2]);
                  }}
                  className="px-3.5 py-1.5 bg-[#1A1A1A] hover:bg-black text-white rounded-md font-bold text-xs transition flex items-center gap-1"
                >
                  <span>{t.priority3Btn}</span>
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column (4 cols): Minimal 7-Day Trend + Soundbox Activity */}
        <div className="lg:col-span-4 space-y-3">
          
          {/* 7-Day Sales Trend (Minimal, Restrained Paytm FinTech Style) */}
          <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block">
                  {t.velocityHeading}
                </span>
                <h3 className="text-sm font-bold text-[#071E46]">
                  {t.trendHeading}
                </h3>
              </div>
              <span className="text-[11px] font-bold text-[#00875A] bg-[#00875A]/10 px-2 py-0.5 rounded border border-[#00875A]/20">
                {t.trendWeeklyUplift}
              </span>
            </div>

            {/* Restrained Bar Visualization */}
            <div className="pt-2">
              <div className="h-28 flex items-end justify-between gap-1.5 border-b border-[#E5E7EB] pb-1">
                {[
                  { dayIdx: 0, val: 62000, height: '62%' },
                  { dayIdx: 1, val: 65000, height: '68%' },
                  { dayIdx: 2, val: 61000, height: '60%' },
                  { dayIdx: 3, val: 68000, height: '76%' },
                  { dayIdx: 4, val: 71000, height: '82%' },
                  { dayIdx: 5, val: 78000, height: '94%' },
                  { dayIdx: 6, val: 74036, height: '88%', active: true }
                ].map((bar, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                    <div 
                      className={`w-full rounded-t-sm transition-colors ${
                        bar.active 
                          ? 'bg-[#002970]' 
                          : 'bg-[#E5E7EB] hover:bg-[#D1D5DB]'
                      }`}
                      style={{ height: bar.height }}
                      title={`${t.trendDays[bar.dayIdx]}: ${formatLocalizedCurrency(bar.val, currentLang)}`}
                    />
                    <span className={`text-[10px] font-semibold ${bar.active ? 'text-[#002970] font-bold' : 'text-[#6B7280]'}`}>
                      {t.trendDays[bar.dayIdx]}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center text-[10px] text-[#6B7280] pt-1.5 font-medium tabular-nums">
                <span>{t.trendAvgDaily}</span>
                <span className="text-[#1A1A1A] font-bold">{t.trendTodaySales}</span>
              </div>
            </div>
          </div>

          {/* Soundbox 4G Hardware Integration Card */}
          <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00875A] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00875A]"></span>
                </span>
                <span className="text-xs font-bold text-[#071E46]">{t.soundboxHardwareHeading}</span>
              </div>
              <span className="text-[10px] text-[#6B7280] font-mono">{t.soundboxBriefTime}</span>
            </div>

            {/* Audio Script */}
            <div className="p-2.5 bg-[#F5F7FA] rounded-lg border border-[#E5E7EB] text-xs text-[#1A1A1A] leading-relaxed font-medium italic">
              {t.soundboxAudioScript}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={onOpenSoundbox}
                className="py-1.5 px-2 rounded-md bg-[#F5F7FA] hover:bg-[#E5E7EB] text-[#1A1A1A] font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Play className="w-3.5 h-3.5 fill-[#1A1A1A]" />
                <span>{t.soundboxPlayBtn}</span>
              </button>
              <button
                onClick={onOpenSoundbox}
                className="py-1.5 px-2 rounded-md border border-[#E5E7EB] hover:bg-[#F5F7FA] text-[#6B7280] font-medium flex items-center justify-center gap-1.5 transition"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{t.soundboxShareBtn}</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Evidence & Why Drawer / Modal */}
      {selectedEvidenceAction && (
        <EvidenceModal
          action={selectedEvidenceAction}
          onClose={() => setSelectedEvidenceAction(null)}
          onApprove={() => {
            handleApproveAction(selectedEvidenceAction);
            setSelectedEvidenceAction(null);
          }}
          currentLang={currentLang}
        />
      )}

      {/* Credit / Working Capital Details Modal */}
      {selectedCreditAction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl max-w-md w-full p-5 sm:p-6 shadow-xl border border-[#E5E7EB] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00875A]"></span>
                <h3 className="font-bold text-[#071E46] text-base">
                  {currentLang === 'mr' ? 'दिवाळी खेळते भांडवल तपशील' : currentLang === 'hi' ? 'दिवाली वर्किंग कैपिटल शर्तें' : 'Diwali Working Capital Terms'}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedCreditAction(null)}
                className="p-1 rounded text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#F5F7FA]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#6B7280] leading-relaxed">
              <div className="p-3 bg-[#F5F7FA] rounded-lg border border-[#E5E7EB] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[#6B7280]">{currentLang === 'mr' ? 'मंजूर क्रेडिट मर्यादा:' : currentLang === 'hi' ? 'स्वीकृत क्रेडिट लिमिट:' : 'Pre-approved Limit:'}</span>
                  <span className="font-black text-[#1A1A1A] text-sm tabular-nums">{formatLocalizedCurrency(50000, currentLang)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#6B7280]">{currentLang === 'mr' ? 'दैनिक वजावट:' : currentLang === 'hi' ? 'दैनिक कटौती:' : 'Daily Settlement Deduction:'}</span>
                  <span className="font-bold text-[#002970]">{currentLang === 'mr' ? '१.२% (~₹५८९ / दिवस)' : currentLang === 'hi' ? '1.2% (~₹589 / दिन)' : '1.2% (~₹589 / day)'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#6B7280]">{currentLang === 'mr' ? 'परतफेड मुदत:' : currentLang === 'hi' ? 'चुकता अवधि:' : 'Repayment Window:'}</span>
                  <span className="font-semibold text-[#1A1A1A]">{formatLocalizedNumber(90, currentLang)} {currentLang === 'mr' ? 'दिवस' : currentLang === 'hi' ? 'दिन' : 'days'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#6B7280]">{currentLang === 'mr' ? 'व्याज दर:' : currentLang === 'hi' ? 'ब्याज दर:' : 'Interest Rate:'}</span>
                  <span className="font-semibold text-[#1A1A1A]">{currentLang === 'mr' ? '१.१% दरमहा फ्लॅट' : currentLang === 'hi' ? '1.1% प्रति माह फ्लैट' : '1.1% per month flat'}</span>
                </div>
              </div>

              <p className="text-[11px] text-[#6B7280] italic">
                {currentLang === 'mr' 
                  ? 'कोणत्याही कागदपत्रांची आवश्यकता नाही. रोजच्या साउंडबॉक्स सेटलमेंटमधून थेट १.२% वजा होईल.'
                  : currentLang === 'hi'
                  ? 'बिना किसी कागजी कार्रवाई के तुरंत क्रेडिट। दैनिक साउंडबॉक्स सेटलमेंट से स्वतः 1.2% की कटौती होगी।'
                  : 'Zero paperwork required. Automatic deduction of 1.2% from daily Paytm QR settlements.'}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-[#E5E7EB]">
              <button
                onClick={() => setSelectedCreditAction(null)}
                className="flex-1 py-2 px-3 border border-[#E5E7EB] text-[#1A1A1A] rounded-lg font-bold text-xs hover:bg-[#F5F7FA] transition"
              >
                {t.notNow}
              </button>
              <button
                onClick={(e) => {
                  handleApproveAction(selectedCreditAction, e);
                  setSelectedCreditAction(null);
                }}
                className="flex-1 py-2 px-3 bg-[#002970] hover:bg-[#071E46] text-white rounded-lg font-bold text-xs transition"
              >
                {currentLang === 'mr' ? 'क्रेडिट सक्रिय करा' : currentLang === 'hi' ? 'क्रेडिट सक्रिय करें' : 'Activate Credit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Broadcast Campaign Simulator Modal */}
      {isWhatsAppOpen && (
        <WhatsAppSimulatorModal
          isOpen={isWhatsAppOpen}
          onClose={() => setIsWhatsAppOpen(false)}
          onConfirm={(result) => {
            setIsWhatsAppOpen(false);
            handleApproveAction(topActions[1]);
          }}
          currentLang={currentLang}
        />
      )}

    </div>
  );
}
