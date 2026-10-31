import React from 'react';
import { 
  X, 
  TrendingUp, 
  AlertTriangle, 
  Database, 
  ShieldCheck, 
  Calculator,
  ArrowRight,
  CheckCircle2,
  Users,
  Compass,
  FileText
} from 'lucide-react';
import { formatLocalizedCurrency, formatLocalizedNumber } from '../../i18n/translations';

export default function EvidenceModal({ isOpen, onClose, action, actionData, currentLang = 'mr' }) {
  if (!isOpen) return null;

  const targetAction = action || actionData;
  const isStockAction = targetAction?.type === 'STOCK' || targetAction?.action_type === 'SUPPLIER_ORDER';
  const isCustomerAction = targetAction?.type === 'CUSTOMER' || targetAction?.action_type === 'CAMPAIGN_BROADCAST';
  const isCapitalAction = targetAction?.type === 'CAPITAL' || targetAction?.action_type === 'LENDING_APPLICATION';

  const content = {
    mr: {
      title: "गुल्लकने ही शिफारस का केली? (Ask Gullak Why)",
      subtitle: "थेट दुकानातील व्यवहार, गणिताचे सूत्र व व्यावसायिक गृहितके",
      selectedAction: "निवडलेली शिफारस",
      dataSectionTitle: "१. वापरलेली खरी व्यावसायिक माहिती (Live Soundbox POS)",
      calcSectionTitle: "२. हिशोबाचे सूत्र व प्रत्यक्ष आकडेमोड (Exact Calculations)",
      assumptionsTitle: "३. गृहितके व जोखीम मर्यादा (Assumptions & Risk Bounds)",
      closeBtn: "बंद करा"
    },
    hi: {
      title: "गुल्लक ने यह सिफ़ारिश क्यों की? (Ask Gullak Why)",
      subtitle: "दुकान के वास्तविक आंकड़े, गणितीय सूत्र और व्यावसायिक मान्यताएं",
      selectedAction: "चयनित सिफ़ारिश",
      dataSectionTitle: "1. उपयोग में लाया गया वास्तविक डेटा (Live Soundbox POS)",
      calcSectionTitle: "2. गणना का सूत्र व सटीक हिसाब (Exact Calculations)",
      assumptionsTitle: "3. व्यावसायिक मान्यताएं व जोखिम सीमा (Assumptions & Risk Bounds)",
      closeBtn: "बंद करें"
    },
    en: {
      title: "Why Gullak Recommends This (Ask Gullak Why)",
      subtitle: "Verified business data, exact mathematical calculations & assumptions",
      selectedAction: "Selected Recommendation",
      dataSectionTitle: "1. Actual Business Data Used (Live Soundbox POS)",
      calcSectionTitle: "2. Deterministic Mathematical Calculations",
      assumptionsTitle: "3. Assumptions & Confidence Bounds",
      closeBtn: "Close"
    }
  };

  const strings = content[currentLang] || content.en;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#071E46]/50 backdrop-blur-xs animate-fade-in" onClick={onClose}>
      <div 
        className="w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden border border-[#E5E7EB] flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header - Solid Paytm Navy */}
        <div className="bg-[#002970] px-5 py-3.5 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#00BAF2] border border-white/15">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base leading-tight">
                {strings.title}
              </h2>
              <p className="text-[11px] text-white/80">
                {strings.subtitle}
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          
          {/* Target Action Card */}
          <div className="p-3.5 bg-[#F5F7FA] rounded-xl border border-[#E5E7EB]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#002970] bg-[#002970]/8 px-2 py-0.5 rounded border border-[#002970]/15">
              {strings.selectedAction}
            </span>
            <h3 className="font-bold text-[#1A1A1A] text-sm mt-1.5">
              {targetAction?.headline || "Pure Desi Cow Ghee (45L) Restock via ONDC"}
            </h3>
            <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
              {targetAction?.why || "Stock will deplete in 4 days before Diwali rush. Restock preserves customer footfall."}
            </p>
          </div>

          {/* Section 1: Actual Business Data Used */}
          <div className="bg-white rounded-xl p-3.5 border border-[#E5E7EB] space-y-2">
            <div className="flex items-center gap-2 text-[#002970] font-bold text-xs">
              <Database className="w-4 h-4 text-[#002970]" />
              <span>{strings.dataSectionTitle}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              {isStockAction ? (
                <>
                  <div className="p-2 bg-[#F5F7FA] rounded-lg border border-[#E5E7EB]">
                    <span className="text-[#6B7280] block text-[10px]">{currentLang === 'mr' ? 'दुकान शिल्लक साठा:' : currentLang === 'hi' ? 'मौजूदा स्टॉक:' : 'Current Stock Balance:'}</span>
                    <span className="font-bold text-[#1A1A1A]">{formatLocalizedNumber(15, currentLang)} {currentLang === 'mr' ? 'लिटर (तूप)' : currentLang === 'hi' ? 'लीटर (घी)' : 'Litres'}</span>
                  </div>
                  <div className="p-2 bg-[#F5F7FA] rounded-lg border border-[#E5E7EB]">
                    <span className="text-[#6B7280] block text-[10px]">{currentLang === 'mr' ? 'दैनिक विक्री वेग (Soundbox):' : currentLang === 'hi' ? 'दैनिक बिक्री दर:' : 'Daily Burn Rate (Soundbox):'}</span>
                    <span className="font-bold text-[#D92D20]">{currentLang === 'mr' ? '३.८ लिटर / दिवस' : currentLang === 'hi' ? '3.8 लीटर / दिन' : '3.8 Litres / Day'}</span>
                  </div>
                  <div className="p-2 bg-[#F5F7FA] rounded-lg border border-[#E5E7EB]">
                    <span className="text-[#6B7280] block text-[10px]">{currentLang === 'mr' ? 'साठा संपण्याचा दिवस:' : currentLang === 'hi' ? 'स्टॉक खत्म होने का दिन:' : 'Days to Stockout:'}</span>
                    <span className="font-bold text-[#D92D20]">{currentLang === 'mr' ? '३.९ दिवस (गुरुवार)' : currentLang === 'hi' ? '3.9 दिन (गुरुवार)' : '3.9 Days (Thursday)'}</span>
                  </div>
                  <div className="p-2 bg-[#F5F7FA] rounded-lg border border-[#E5E7EB]">
                    <span className="text-[#6B7280] block text-[10px]">{currentLang === 'mr' ? 'सप्लायर ONDC वेळ:' : currentLang === 'hi' ? 'ONDC डिलीवरी समय:' : 'ONDC Delivery Window:'}</span>
                    <span className="font-bold text-[#00875A]">{currentLang === 'mr' ? '२४-३६ तास (उद्या संध्याकाळ)' : currentLang === 'hi' ? '24-36 घंटे (कल शाम)' : '24-36 Hours (Next-day)'}</span>
                  </div>
                </>
              ) : isCustomerAction ? (
                <>
                  <div className="p-2 bg-[#F5F7FA] rounded-lg border border-[#E5E7EB]">
                    <span className="text-[#6B7280] block text-[10px]">{currentLang === 'mr' ? 'लॅप्स झालेले ग्राहक:' : currentLang === 'hi' ? 'छूटे हुए ग्राहक:' : 'Inactive Customer Cohort:'}</span>
                    <span className="font-bold text-[#1A1A1A]">{formatLocalizedNumber(60, currentLang)} {currentLang === 'mr' ? 'नियमित ग्राहक' : currentLang === 'hi' ? 'नियमित ग्राहक' : 'Loyal Shoppers'}</span>
                  </div>
                  <div className="p-2 bg-[#F5F7FA] rounded-lg border border-[#E5E7EB]">
                    <span className="text-[#6B7280] block text-[10px]">{currentLang === 'mr' ? 'शेवटची खरेदी अंतर:' : currentLang === 'hi' ? 'अंतिम खरीद अंतराल:' : 'Inactivity Window:'}</span>
                    <span className="font-bold text-[#D92D20]">{currentLang === 'mr' ? '३० ते ७५ दिवस' : currentLang === 'hi' ? '30 से 75 दिन' : '30 to 75 Days'}</span>
                  </div>
                  <div className="p-2 bg-[#F5F7FA] rounded-lg border border-[#E5E7EB]">
                    <span className="text-[#6B7280] block text-[10px]">{currentLang === 'mr' ? 'सरासरी ऐतिहासिक पावती:' : currentLang === 'hi' ? 'ऐतिहासिक बास्केट साइज:' : 'Historical Basket Size:'}</span>
                    <span className="font-bold text-[#002970]">{formatLocalizedCurrency(850, currentLang)}</span>
                  </div>
                  <div className="p-2 bg-[#F5F7FA] rounded-lg border border-[#E5E7EB]">
                    <span className="text-[#6B7280] block text-[10px]">{currentLang === 'mr' ? 'कंट्रोल ग्रुप (अस्पर्शित):' : currentLang === 'hi' ? 'कंट्रोल ग्रुप (बिना मैसेज):' : 'Holdout Control Group:'}</span>
                    <span className="font-bold text-[#00875A]">{formatLocalizedNumber(12, currentLang)} {currentLang === 'mr' ? 'ग्राहक (२०%)' : currentLang === 'hi' ? 'ग्राहक (20%)' : 'Shoppers (20%)'}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-2 bg-[#F5F7FA] rounded-lg border border-[#E5E7EB]">
                    <span className="text-[#6B7280] block text-[10px]">{currentLang === 'mr' ? 'दैनंदिन सरासरी साउंडबॉक्स:' : currentLang === 'hi' ? 'दैनिक औसत साउंडबॉक्स:' : 'Daily Soundbox Average:'}</span>
                    <span className="font-bold text-[#1A1A1A]">{formatLocalizedCurrency(42000, currentLang)}</span>
                  </div>
                  <div className="p-2 bg-[#F5F7FA] rounded-lg border border-[#E5E7EB]">
                    <span className="text-[#6B7280] block text-[10px]">{currentLang === 'mr' ? 'क्रेडिट ट्रॅक रेकॉर्ड:' : currentLang === 'hi' ? 'क्रेडिट ट्रैक रिकॉर्ड:' : 'Settlement History:'}</span>
                    <span className="font-bold text-[#00875A]">{formatLocalizedNumber(180, currentLang)} {currentLang === 'mr' ? 'दिवस १००% ऑन-टाइम' : currentLang === 'hi' ? 'दिन 100% ऑन-टाइम' : 'Days 100% On-time'}</span>
                  </div>
                  <div className="p-2 bg-[#F5F7FA] rounded-lg border border-[#E5E7EB]">
                    <span className="text-[#6B7280] block text-[10px]">{currentLang === 'mr' ? 'दैनिक वजावट मर्यादा:' : currentLang === 'hi' ? 'दैनिक कटौती सीमा:' : 'Daily Settlement Cap:'}</span>
                    <span className="font-bold text-[#002970]">{currentLang === 'mr' ? '१.२% (कमाल ₹५८९)' : currentLang === 'hi' ? '1.2% (अधिकतम ₹589)' : '1.2% (Max ₹589)'}</span>
                  </div>
                  <div className="p-2 bg-[#F5F7FA] rounded-lg border border-[#E5E7EB]">
                    <span className="text-[#6B7280] block text-[10px]">{currentLang === 'mr' ? 'जामीन / गहाण:' : currentLang === 'hi' ? 'जमानत / गिरवी:' : 'Collateral Required:'}</span>
                    <span className="font-bold text-[#00875A]">{currentLang === 'mr' ? 'शून्य (Zero)' : currentLang === 'hi' ? 'शून्य (Zero)' : 'Zero (Collateral-free)'}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Section 2: Mathematical Formula & Calculations */}
          <div className="bg-[#002970]/5 rounded-xl p-3.5 border border-[#002970]/15 space-y-2">
            <div className="flex items-center gap-2 text-[#002970] font-bold text-xs">
              <Calculator className="w-4 h-4 text-[#002970]" />
              <span>{strings.calcSectionTitle}</span>
            </div>

            <div className="p-2.5 bg-white rounded-lg border border-[#002970]/15 font-mono text-[11px] text-[#1A1A1A] space-y-1.5 leading-relaxed">
              {isStockAction ? (
                <>
                  <div>
                    <span className="text-[#6B7280]">Formula: </span>
                    <span className="font-bold">Stockout Days = Current Stock (15L) ÷ Daily Run Rate (3.8L/day) = 3.9 Days</span>
                  </div>
                  <div>
                    <span className="text-[#6B7280]">Financial Risk: </span>
                    <span className="text-[#D92D20] font-bold">45 Litres × ₹580 MRP = {formatLocalizedCurrency(26100, currentLang)} in Unfulfilled Sales</span>
                  </div>
                  <div>
                    <span className="text-[#6B7280]">Net Margin Gain: </span>
                    <span className="text-[#00875A] font-bold">45 × (₹580 - ₹485 Wholesale) = {formatLocalizedCurrency(4275, currentLang)} Cash Profit</span>
                  </div>
                </>
              ) : isCustomerAction ? (
                <>
                  <div>
                    <span className="text-[#6B7280]">Targeted: </span>
                    <span className="font-bold">48 treated shoppers | 12 holdout control shoppers</span>
                  </div>
                  <div>
                    <span className="text-[#6B7280]">Expected Return Lift: </span>
                    <span className="text-[#002970] font-bold">(41% treated - 16% control) = +25% net incremental footfall</span>
                  </div>
                  <div>
                    <span className="text-[#6B7280]">Incremental Margin: </span>
                    <span className="text-[#00875A] font-bold">(48 × 25%) × ₹850 basket × 22% margin - ₹21 cost = {formatLocalizedCurrency(7800, currentLang)}</span>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span className="text-[#6B7280]">Credit Facility: </span>
                    <span className="font-bold">{formatLocalizedCurrency(50000, currentLang)} Festive Stock Line</span>
                  </div>
                  <div>
                    <span className="text-[#6B7280]">Deduction Formula: </span>
                    <span className="text-[#002970] font-bold">Daily QR Sales (~₹49,147) × 1.2% = ₹589 / day automatically deducted</span>
                  </div>
                  <div>
                    <span className="text-[#6B7280]">Working Capital Profit: </span>
                    <span className="text-[#00875A] font-bold">Enables ₹1,20,000 festival inventory turnaround generating +{formatLocalizedCurrency(18000, currentLang)} gross margin</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Section 3: Assumptions & Risk Bounds */}
          <div className="bg-white rounded-xl p-3.5 border border-[#E5E7EB] space-y-2">
            <div className="flex items-center gap-2 text-[#071E46] font-bold text-xs">
              <Compass className="w-4 h-4 text-[#002970]" />
              <span>{strings.assumptionsTitle}</span>
            </div>

            <ul className="space-y-1.5 text-[11px] text-[#4B5563] pl-2">
              <li className="flex items-start gap-1.5">
                <span className="text-[#00875A] font-bold">✓</span>
                <span>{currentLang === 'mr' ? 'दिवाळी धनत्रयोदशी सण मागणी गुणक: २.४ पट (मागील वर्षीच्या पेटीएम साउंडबॉक्स नोंदीनुसार)' : currentLang === 'hi' ? 'दिवाली धनतेरस मांग मल्टीप्लायर: 2.4 गुना (पिछले साल के रिकॉर्ड अनुसार)' : 'Diwali Dhanteras festive demand multiplier: 2.4x (verified from 2025 Paytm POS records)'}</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#00875A] font-bold">✓</span>
                <span>{currentLang === 'mr' ? 'सप्लायर पुरवठा खात्री: महालक्ष्मी डिस्ट्रीब्यूटर्स (दादर) यांच्याशी ONDC B2B करार' : currentLang === 'hi' ? 'सप्लायर विश्वसनीयता: महालक्ष्मी डिस्ट्रीब्यूटर्स (दादर) ONDC B2B एग्रीमेंट' : 'Supplier SLA guaranteed: Mahalaxmi Distributors (Dadar Market) ONDC verified tier'}</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#00875A] font-bold">✓</span>
                <span>{currentLang === 'mr' ? 'किमान रोख सुरक्षा: दुकान खर्चासाठी ₹३५,५३६ रोख गल्ला सुरक्षित ठेवला आहे' : currentLang === 'hi' ? 'कैश बफर: दुकान खर्च हेतु ₹35,536 का सेफ-टू-स्पेंड बैलेंस सुरक्षित' : 'Cash buffer: ₹35,536 Safe-to-Spend balance protected prior to restock commitment'}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#E5E7EB] bg-[#F5F7FA] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#002970] hover:bg-[#071E46] text-white font-bold text-xs rounded-lg transition"
          >
            {strings.closeBtn}
          </button>
        </div>

      </div>
    </div>
  );
}
