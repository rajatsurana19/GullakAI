import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Database, ShieldCheck, Calculator } from 'lucide-react';

const dataSourceMap = {
  mr: {
    "Store Transactions": "Paytm साऊंडबॉक्स व गल्ला नोंदी",
    "Paytm Transaction History": "Paytm साऊंडबॉक्स नोंदी",
    "Festive Forecast Model": "दिवाळी सण विक्री कल",
    "LightGBM Festive Model": "दिवाळी सण विक्री कल",
    "Current Stock": "दुकानातील प्रत्यक्ष साठा",
    "Warehouse Stock": "गोदाम व दुकानातील प्रत्यक्ष साठा",
    "Causal Uplift Engine": "ग्राहकांची खरेदीची सवय",
    "RFM Loyalty Model": "नियमित ग्राहक नोंदी",
    "Yesterday's sales volume": "कालच्या विक्रीच्या प्रत्यक्ष नोंदी",
    "Festive demand": "सणासुदीची वाढती मागणी",
    "Store inventory count": "दुकानातील उपलब्ध शिल्लक माल",
    "Safety stock thresholds": "किमान आवश्यक साठ्याचे नियम",
    "Supplier pricing sheet": "व्यापाऱ्याचे घाऊक दर",
    "Customer visit history": "ग्राहकांच्या खरेदीच्या तारखा",
    "Festive offers": "दिवाळी सवलत योजना"
  },
  hi: {
    "Store Transactions": "Paytm साउंडबॉक्स और दुकान रिकॉर्ड",
    "Paytm Transaction History": "Paytm साउंडबॉक्स रिकॉर्ड",
    "Festive Forecast Model": "त्योहारी मांग और बिक्री रुझान",
    "LightGBM Festive Model": "त्योहारी मांग और बिक्री रुझान",
    "Current Stock": "दुकान में मौजूद स्टॉक",
    "Warehouse Stock": "दुकान व गोदाम का स्टॉक",
    "Causal Uplift Engine": "ग्राहकों की खरीदारी का तरीका",
    "RFM Loyalty Model": "नियमित ग्राहक रिकॉर्ड",
    "Yesterday's sales volume": "कल की वास्तविक बिक्री",
    "Festive demand": "त्योहार की मांग",
    "Store inventory count": "दुकान में बचा हुआ सामान",
    "Safety stock thresholds": "सुरक्षित स्टॉक सीमा",
    "Supplier pricing sheet": "सप्लायर की थोक दरें",
    "Customer visit history": "ग्राहकों का खरीदारी इतिहास",
    "Festive offers": "दिवाली स्पेशल ऑफर"
  },
  en: {
    "Store Transactions": "Paytm Soundbox & Shop Records",
    "Paytm Transaction History": "Paytm Soundbox Records",
    "Festive Forecast Model": "Festive Sales Trend",
    "LightGBM Festive Model": "Festive Sales Trend",
    "Current Stock": "Current Shop Inventory",
    "Warehouse Stock": "Store & Stockroom Inventory",
    "Causal Uplift Engine": "Customer Purchase Habits",
    "RFM Loyalty Model": "Regular Customer Records",
    "Yesterday's sales volume": "Yesterday's Actual Sales",
    "Festive demand": "Festive Demand",
    "Store inventory count": "Store Stock Count",
    "Safety stock thresholds": "Safety Stock Thresholds",
    "Supplier pricing sheet": "Wholesale Supplier Rates",
    "Customer visit history": "Customer Visit Dates",
    "Festive offers": "Festival Offers"
  }
};

const uiTexts = {
  mr: {
    title: "गुल्लकने हा सल्ला का दिला? (Ask Gullak Why)",
    subtitle: "थेट दुकानातील व्यवहार व गणितीय हिशोब",
    suggestedAction: "पुढील पाऊल:",
    basedOn: "माहितीचा आधार:"
  },
  hi: {
    title: "गुल्लक ने यह सलाह क्यों दी? (Ask Gullak Why)",
    subtitle: "वास्तविक दुकान डेटा और गणितीय गणना",
    suggestedAction: "सुझाव / अगला कदम:",
    basedOn: "जानकारी का आधार:"
  },
  en: {
    title: "Why Gullak Recommends This (Ask Gullak Why)",
    subtitle: "Live POS data & exact mathematical calculations",
    suggestedAction: "Next Step:",
    basedOn: "Based on:"
  }
};

export default function WhyExplanationCard({ title, explanation, dataSources = [], suggestedAction, lang }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const activeLang = lang || (typeof window !== 'undefined' ? localStorage.getItem('gullak_language') : null) || 'mr';
  const effectiveLang = ['mr', 'hi', 'en'].includes(activeLang) ? activeLang : 'mr';

  const t = uiTexts[effectiveLang] || uiTexts.mr;
  const dsMap = dataSourceMap[effectiveLang] || dataSourceMap.mr;

  const displayTitle = title || t.title;
  const friendlySources = dataSources.map(ds => dsMap[ds] || ds);

  return (
    <div className="bg-[#002970]/5 border border-[#002970]/15 rounded-xl p-3 sm:p-4 my-2 transition-all">
      <div 
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#002970]/10 text-[#002970] flex items-center justify-center flex-shrink-0">
            <Calculator className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[#002970] flex items-center gap-1.5 flex-wrap">
              <span>{displayTitle}</span>
              <span className="text-[11px] font-normal text-[#6B7280]">· {t.subtitle}</span>
            </h4>
          </div>
        </div>
        <button 
          type="button"
          aria-label="Toggle explanation"
          className="text-[#6B7280] hover:text-[#002970] p-1 rounded-md"
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-3 pt-3 border-t border-[#002970]/15 text-xs text-[#1A1A1A] space-y-2.5">
          <p className="leading-relaxed font-medium">
            {explanation}
          </p>

          {suggestedAction && (
            <div className="p-2.5 bg-white rounded-lg border border-[#E5E7EB] flex items-start gap-2">
              <span className="font-bold text-[#002970] text-[11px] uppercase tracking-wide flex-shrink-0 mt-0.5">
                {t.suggestedAction}
              </span>
              <span className="text-[#1A1A1A] font-semibold">{suggestedAction}</span>
            </div>
          )}

          {friendlySources.length > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] text-[#6B7280] pt-1 flex-wrap">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00875A] flex-shrink-0" />
              <span>{t.basedOn} {friendlySources.join(', ')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
