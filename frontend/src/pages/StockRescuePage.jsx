import React, { useState, useEffect } from 'react';
import { 
  PackageOpen, 
  RefreshCw, 
  ArrowRightLeft, 
  Percent, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Coins, 
  Clock, 
  Check, 
  Send, 
  Boxes, 
  MapPin, 
  Star, 
  ShieldCheck, 
  X, 
  PhoneCall, 
  Printer, 
  ChevronRight, 
  MessageCircle, 
  Tag 
} from 'lucide-react';
import { apiClient } from '../api/client';
import { LoadingState } from '../components/common/EmptyState';
import { translations, formatLocalizedNumber, formatLocalizedCurrency } from '../i18n/translations';

export default function StockRescuePage({ currentLang = 'mr', onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [executingId, setExecutingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [classificationFilter, setClassificationFilter] = useState('ALL'); // 'ALL', 'SLOW', 'AT_RISK', 'DEAD'

  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'B2B_SWAP' | 'WHATSAPP_FLASH' | 'BUNDLE' | 'SUPPLIER_RETURN'
  const [selectedItem, setSelectedItem] = useState(null);

  // WhatsApp Flash Modal state
  const [discountPercent, setDiscountPercent] = useState(20);
  const [includeCoupon, setIncludeCoupon] = useState(true);
  const [couponCode, setCouponCode] = useState('SOUP20');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastDone, setBroadcastDone] = useState(false);

  // B2B Swap Modal state
  const [swapConfirmed, setSwapConfirmed] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getStockRescueOverview(currentLang);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentLang]);

  const handleOpenActionModal = (item) => {
    setSelectedItem(item);
    setActiveModal(item.recommended_strategy);
    setBroadcastDone(false);
    setSwapConfirmed(false);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setSelectedItem(null);
    setBroadcastDone(false);
    setSwapConfirmed(false);
  };

  const handleExecute = async (item, strategy) => {
    try {
      setExecutingId(item.id);
      const res = await apiClient.executeStockRescue(item.id, strategy, discountPercent);
      setSuccessMsg(res.message || 'Rescue plan initiated!');
      setTimeout(() => {
        setSuccessMsg(null);
      }, 3500);
    } catch (err) {
      alert(err.message || 'Failed to initiate rescue plan');
    } finally {
      setExecutingId(null);
    }
  };

  const handleConfirmSwap = async () => {
    if (!selectedItem) return;
    setSwapConfirmed(true);
    await handleExecute(selectedItem, 'B2B_SWAP');
  };

  const handleDispatchWhatsApp = async () => {
    if (!selectedItem) return;
    setIsBroadcasting(true);
    setTimeout(async () => {
      setIsBroadcasting(false);
      setBroadcastDone(true);
      await handleExecute(selectedItem, 'FLASH_DISCOUNT');
    }, 1200);
  };

  if (loading || !data) {
    return <LoadingState message="Scanning store inventory for trapped capital..." />;
  }

  const { meta, summary, items } = data;

  return (
    <div className="space-y-5 max-w-6xl mx-auto pb-16 font-sans text-[#1A1A1A]">
      
      {/* 1. Header (Clean, Solid, No Gradient) */}
      <div className="pb-3 border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#002970] bg-[#002970]/8 border border-[#002970]/20 px-2 py-0.5 rounded">
              Capital Recovery
            </span>
            <span className="text-[11px] text-[#6B7280]">
              Paytm ONDC B2B & Merchant Network
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#071E46] tracking-tight">{meta.title}</h1>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5 max-w-2xl">{meta.subtitle}</p>
        </div>

        <button
          onClick={loadData}
          className="self-start sm:self-auto px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F5F7FA] text-xs font-semibold text-[#1A1A1A] flex items-center gap-1.5 transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#002970]" />
          <span>Refresh Scan</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-3 bg-[#00875A]/10 border border-[#00875A]/25 text-[#00875A] rounded-lg text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#00875A] flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 2. Financial Metric Cards (4 Aligned Panels with Localized Numbers) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Total Trapped */}
        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB]">
          <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">
            {meta.totalTrapped}
          </span>
          <div className="text-2xl font-black text-[#D92D20] mt-1 tabular-nums">
            {formatLocalizedCurrency(summary.total_trapped_inr, currentLang)}
          </div>
          <span className="text-[11px] text-[#6B7280] mt-1 block">
            {currentLang === 'mr' ? '३०+ दिवस हालचाल नसलेला माल' : currentLang === 'hi' ? '30+ दिन से अटका हुआ स्टॉक' : 'Tied up in zero-movement stock'}
          </span>
        </div>

        {/* Estimated Recoverable */}
        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB]">
          <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">
            {meta.recoverableCapital}
          </span>
          <div className="text-2xl font-black text-[#00875A] mt-1 tabular-nums">
            {formatLocalizedCurrency(summary.total_recoverable_inr, currentLang)}
          </div>
          <span className="text-[11px] text-[#00875A] font-semibold mt-1 block">
            {currentLang === 'mr' ? 'खरेदी भाव १००% संरक्षित' : currentLang === 'hi' ? 'खरीद लागत पूरी तरह सुरक्षित' : 'Protected above cost basis'}
          </span>
        </div>

        {/* Recovery Rate */}
        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB]">
          <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">
            {meta.rescueRate}
          </span>
          <div className="text-2xl font-black text-[#002970] mt-1 tabular-nums">
            {formatLocalizedNumber(summary.recovery_percent, currentLang)}%
          </div>
          <span className="text-[11px] text-[#6B7280] mt-1 block">
            {currentLang === 'mr' ? 'अपेक्षित वसुली कार्यक्षमता' : currentLang === 'hi' ? 'अनुमानित वसूली दर' : 'Expected recovery efficiency'}
          </span>
        </div>

        {/* Unproductive Items */}
        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB]">
          <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">
            {meta.itemsCount}
          </span>
          <div className="text-2xl font-black text-[#071E46] mt-1 tabular-nums">
            {formatLocalizedNumber(summary.unproductive_sku_count, currentLang)} SKUs
          </div>
          <span className="text-[11px] text-[#6B7280] mt-1 block">
            {currentLang === 'mr' ? 'कारवाई आवश्यक असलेल्या वस्तू' : currentLang === 'hi' ? 'कार्रवाई योग्य सामान' : 'Items requiring action'}
          </span>
        </div>

      </div>

      {/* Improvement 7: Actual Capital Recovered Tracker */}
      <div className="p-4 bg-[#00875A]/8 rounded-xl border border-[#00875A]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00875A]/15 text-[#00875A] flex items-center justify-center flex-shrink-0">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#00875A] uppercase tracking-wider">
                {currentLang === 'mr' ? 'प्रत्यक्ष भांडवल वसुली ट्रॅकर' : currentLang === 'hi' ? 'वास्तविक पूंजी वसूली ट्रैकर' : 'Actual Capital Recovered Tracker'}
              </span>
              <span className="text-[10px] font-bold text-[#00875A] bg-white px-1.5 py-0.2 rounded border border-[#00875A]/25">
                {currentLang === 'mr' ? '५८% वसूल' : currentLang === 'hi' ? '58% वसूल' : '58% Recovered'}
              </span>
            </div>
            <p className="text-[11px] text-[#4B5563] mt-0.5">
              {currentLang === 'mr'
                ? `अडकलेल्या ₹२४,५०० पैकी ${formatLocalizedCurrency(14200, currentLang)} थेट दुकान खात्यात ONDC B2B स्वॅप व व्हॉट्सॲप क्लिअरन्समधून वसूल झाले आहेत.`
                : currentLang === 'hi'
                ? `फंसे हुए ₹24,500 में से ${formatLocalizedCurrency(14200, currentLang)} सीधे दुकान खाते में ONDC स्वैप और व्हाट्सएप फ्लैश से वसूल किए गए हैं।`
                : `Of ₹24,500 trapped stock, ${formatLocalizedCurrency(14200, currentLang)} has been settled directly back to store account via B2B swaps and WhatsApp flash clearance.`}
            </p>
          </div>
        </div>

        <span className="font-mono text-xs font-black text-[#00875A] bg-white px-3 py-1.5 rounded-lg border border-[#00875A]/20 self-start sm:self-auto">
          +{formatLocalizedCurrency(14200, currentLang)} {currentLang === 'mr' ? 'बँकेत जमा' : currentLang === 'hi' ? 'बैंक जमा' : 'Settled'}
        </span>
      </div>

      {/* Improvement 7: 3-Tier Classification Filter Tabs (Slow-moving, At-risk, Dead stock) */}
      <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#E5E7EB] overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setClassificationFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg transition ${
            classificationFilter === 'ALL'
              ? 'bg-[#002970] text-white'
              : 'text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#F5F7FA]'
          }`}
        >
          {currentLang === 'mr' ? 'सर्व माल' : currentLang === 'hi' ? 'सभी सामान' : 'All Stock'} ({formatLocalizedNumber(items.length, currentLang)})
        </button>
        <button
          onClick={() => setClassificationFilter('SLOW')}
          className={`px-3 py-1.5 rounded-lg transition ${
            classificationFilter === 'SLOW'
              ? 'bg-[#002970] text-white'
              : 'text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#F5F7FA]'
          }`}
        >
          {currentLang === 'mr' ? 'मंद गतीने खपणारा (Slow-Moving)' : currentLang === 'hi' ? 'धीमी गति का स्टॉक (Slow)' : 'Slow-Moving (30-60D)'}
        </button>
        <button
          onClick={() => setClassificationFilter('AT_RISK')}
          className={`px-3 py-1.5 rounded-lg transition ${
            classificationFilter === 'AT_RISK'
              ? 'bg-[#002970] text-white'
              : 'text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#F5F7FA]'
          }`}
        >
          {currentLang === 'mr' ? 'धोक्यात असलेला माल (At-Risk / Expiry)' : currentLang === 'hi' ? 'जोखिमग्रस्त माल (At-Risk)' : 'At-Risk / Near-Expiry'}
        </button>
        <button
          onClick={() => setClassificationFilter('DEAD')}
          className={`px-3 py-1.5 rounded-lg transition ${
            classificationFilter === 'DEAD'
              ? 'bg-[#002970] text-white'
              : 'text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#F5F7FA]'
          }`}
        >
          {currentLang === 'mr' ? 'अडकलेला डेड स्टॉक (Dead Stock 60+ दिवस)' : currentLang === 'hi' ? 'फंसा हुआ डेड स्टॉक (Dead 60+D)' : 'Dead Stock (60+ Days)'}
        </button>
      </div>

      {/* 3. Trapped Inventory & Actionable Recovery Pathways */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#071E46] uppercase tracking-wider">
            {currentLang === 'en' ? 'Identified Stock Rescue Action Cards' : 'अडकून पडलेला माल आणि वसुली मार्ग'}
          </h3>
          <span className="text-xs font-semibold text-[#6B7280]">
            {formatLocalizedNumber(items.length, currentLang)} {currentLang === 'mr' ? 'वस्तू कारवाईसाठी सज्ज' : currentLang === 'hi' ? 'सामान कार्रवाई हेतु तैयार' : 'items requiring action'}
          </span>
        </div>

        <div className="space-y-2.5">
          {items.map((item) => {
            const isActing = executingId === item.id;
            const detailText = item.strategy_details[currentLang] || item.strategy_details.en;
            const rationaleText = item.pairing_rationale ? (item.pairing_rationale[currentLang] || item.pairing_rationale.en) : null;

            return (
              <div 
                key={item.id}
                className="bg-white rounded-xl p-4 sm:p-5 border border-[#E5E7EB] hover:border-[#002970]/40 transition space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base font-bold text-[#071E46]">
                        {currentLang === 'mr' ? item.name_marathi : (currentLang === 'hi' ? item.name_hindi : item.name)}
                      </h4>
                      <span className="text-[10px] font-bold text-[#D92D20] bg-[#D92D20]/10 px-2 py-0.5 rounded border border-[#D92D20]/20">
                        {item.days_no_sale} days zero sales
                      </span>
                      <span className="text-[10px] font-semibold text-[#6B7280] bg-[#F5F7FA] px-2 py-0.5 rounded border border-[#E5E7EB]">
                        {item.category} • MRP: ₹{item.mrp} • Cost: ₹{item.cost_price}
                      </span>
                    </div>

                    <div className="text-xs text-[#6B7280] flex items-center gap-4 pt-0.5">
                      <span>Stock: <strong className="text-[#1A1A1A]">{item.stock_qty} {item.unit}</strong></span>
                      <span>Trapped Capital: <strong className="text-[#D92D20]">₹{item.trapped_capital_inr.toLocaleString('en-IN')}</strong></span>
                      <span>Estimated Recovery: <strong className="text-[#00875A]">₹{item.recoverable_capital_inr.toLocaleString('en-IN')}</strong></span>
                    </div>
                  </div>

                  {/* Recovery Action Pill */}
                  <span className={`self-start text-xs font-bold px-2.5 py-1 rounded border uppercase tracking-wider ${
                    item.recommended_strategy === 'B2B_SWAP'
                      ? 'bg-[#002970]/10 text-[#002970] border-[#002970]/20'
                      : item.recommended_strategy === 'FLASH_DISCOUNT'
                      ? 'bg-[#E99A00]/10 text-[#B87A00] border-[#E99A00]/25'
                      : 'bg-[#00875A]/10 text-[#00875A] border-[#00875A]/25'
                  }`}>
                    {item.strategy_label[currentLang] || item.strategy_label.en}
                  </span>
                </div>

                {/* Strategy Explanation & Pairings */}
                <div className="p-3 bg-[#F5F7FA] rounded-lg border border-[#E5E7EB] text-xs space-y-1.5">
                  <p className="text-[#1A1A1A] leading-relaxed font-medium">
                    {detailText}
                  </p>
                  {rationaleText && (
                    <div className="text-[#6B7280] text-[11px] pt-1 border-t border-[#E5E7EB] flex items-start gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-[#002970] flex-shrink-0 mt-0.5" />
                      <span>{rationaleText}</span>
                    </div>
                  )}
                </div>

                {/* Primary Action Button */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-[#6B7280]">
                    Breakeven Protected: Min. Price <strong>₹{item.cost_price}</strong>
                  </span>

                  <button
                    onClick={() => handleOpenActionModal(item)}
                    disabled={isActing}
                    className="px-4 py-2 bg-[#002970] hover:bg-[#071E46] text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <span>
                      {item.recommended_strategy === 'B2B_SWAP'
                        ? (currentLang === 'mr' ? 'B2B अदलाबदल तपासा →' : currentLang === 'hi' ? 'B2B अदला-बदली देखें →' : 'Review B2B Swap →')
                        : item.recommended_strategy === 'FLASH_DISCOUNT'
                        ? (currentLang === 'mr' ? 'व्हॉट्सॲप ऑफर पाठवा →' : currentLang === 'hi' ? 'व्हाट्सएप ऑफर भेजें →' : 'Launch WhatsApp Flash →')
                        : (currentLang === 'mr' ? 'कॉम्बो बंडल तयार करा →' : currentLang === 'hi' ? 'कॉम्बो बंडल बनाएं →' : 'Create Combo Bundle →')}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: B2B Merchant Swap */}
      {activeModal === 'B2B_SWAP' && selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 sm:p-6 shadow-xl border border-[#E5E7EB] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-[#002970]" />
                <h3 className="font-bold text-[#071E46] text-base">
                  {currentLang === 'mr' ? 'ONDC स्थानिक व्यापारी साठा अदलाबदल' : 'ONDC Local Merchant Stock Swap'}
                </h3>
              </div>
              <button onClick={handleCloseModal} className="p-1 rounded text-[#6B7280] hover:text-[#1A1A1A]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#1A1A1A]">
              <div className="p-3 bg-[#F5F7FA] rounded-lg border border-[#E5E7EB] space-y-2">
                <div className="font-bold text-sm text-[#071E46]">
                  Sai Pooja Bhandar (Dadar Market · 800m away)
                </div>
                <div className="text-[#6B7280]">
                  Merchant has high festive footfall and 0 units in stock.
                </div>
                <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
                  <span>Your Excess: <strong>{selectedItem.stock_qty} {selectedItem.unit}</strong></span>
                  <span>Swap For: <strong className="text-[#00875A]">8 Packets Pure Cow Ghee</strong></span>
                </div>
              </div>

              <p className="text-[11px] text-[#6B7280]">
                Zero loss swap. Both merchants verify handoff via Soundbox OTP confirmation.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-[#E5E7EB]">
              <button onClick={handleCloseModal} className="flex-1 py-2 px-3 border border-[#E5E7EB] rounded-lg font-bold text-xs hover:bg-[#F5F7FA]">
                Cancel
              </button>
              <button 
                onClick={() => {
                  handleConfirmSwap();
                  handleCloseModal();
                }} 
                className="flex-1 py-2 px-3 bg-[#002970] hover:bg-[#071E46] text-white rounded-lg font-bold text-xs"
              >
                Confirm B2B Swap
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: WhatsApp Flash Broadcast */}
      {activeModal === 'FLASH_DISCOUNT' && selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 sm:p-6 shadow-xl border border-[#E5E7EB] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#00875A]" />
                <h3 className="font-bold text-[#071E46] text-base">
                  {currentLang === 'mr' ? 'व्हॉट्सॲप फ्लॅश सेल ब्रॉडकास्ट' : 'WhatsApp Flash Sale Broadcast'}
                </h3>
              </div>
              <button onClick={handleCloseModal} className="p-1 rounded text-[#6B7280] hover:text-[#1A1A1A]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#1A1A1A]">
              <div className="p-3 bg-[#F5F7FA] rounded-lg border border-[#E5E7EB] space-y-2">
                <div className="flex justify-between">
                  <span>Selected SKU:</span>
                  <strong className="text-[#071E46]">{selectedItem.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Discount Rate:</span>
                  <strong className="text-[#00875A]">{discountPercent}% OFF (₹{Math.round(selectedItem.mrp * (1 - discountPercent/100))})</strong>
                </div>
                <div className="flex justify-between text-[#6B7280]">
                  <span>Breakeven Cost Floor:</span>
                  <span>₹{selectedItem.cost_price} (Protected)</span>
                </div>
              </div>

              <div className="p-3 bg-[#00875A]/5 rounded-lg border border-[#00875A]/20 text-[11px] text-[#00875A] font-medium">
                Message preview will be dispatched to 42 regular kirana buyers who purchased cooking essentials this month.
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-[#E5E7EB]">
              <button onClick={handleCloseModal} className="flex-1 py-2 px-3 border border-[#E5E7EB] rounded-lg font-bold text-xs hover:bg-[#F5F7FA]">
                Cancel
              </button>
              <button 
                onClick={() => {
                  handleDispatchWhatsApp();
                  handleCloseModal();
                }} 
                className="flex-1 py-2 px-3 bg-[#00875A] hover:bg-[#00704A] text-white rounded-lg font-bold text-xs"
              >
                Dispatch WhatsApp Broadcast
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
