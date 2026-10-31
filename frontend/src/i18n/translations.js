// Paytm Gullak AI Localized Numbering and Financial String Formatter
export function formatLocalizedNumber(num, lang = 'mr') {
  if (num === null || num === undefined) return '';
  const formatted = typeof num === 'number' 
    ? num.toLocaleString('en-IN', { maximumFractionDigits: 0 })
    : String(num);
  if (lang === 'mr' || lang === 'hi') {
    const devaDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    return formatted.replace(/[0-9]/g, d => devaDigits[d]);
  }
  return formatted;
}

export function formatLocalizedCurrency(num, lang = 'mr') {
  return `₹${formatLocalizedNumber(num, lang)}`;
}

export const translations = {
  mr: {
    // Brand & Header
    appSubtitle: "पेटीएम मर्चंट AI बिझनेस पार्टनर",
    soundboxActive: "साउंडबॉक्स 4G सक्रिय",
    soundboxLabel: "साउंडबॉक्स 4G",
    activeStatus: "सक्रिय",
    askGullak: "गुल्लकशी बोला",
    askGullakPlaceholder: "गुल्लकशी काहीही विचारा... (उदा. 'उद्या किती पैसे येतील', 'तूप कधी संपेल')",
    toggleNav: "नेव्हिगेशन",
    notifications: "सूचना",
    hearSoundbox: "साउंडबॉक्स आवाज ऐका",
    soundboxBriefTitle: "Paytm साउंडबॉक्स दैनिक घोषणा",
    runBriefNow: "आजची माहिती आत्ता ऐका",
    profileTitle: "दुकानदार प्रोफाइल व गोपनीयता",
    devAppendix: "तांत्रिक तपशील (Appendix)",

    // Greeting & Subtitle
    goodMorning: "शुभ प्रभात",
    merchantName: "राजेश कुमार",
    storeName: "श्री साई किराणा आणि स्वीट्स",
    diwaliCountdown: "दिवाळी ९ दिवसांवर",
    storeLocation: "दादर मार्केट, मुंबई",
    merchantMotto: "छोटे कदम, मोठी प्रगती.",

    // The 5 Core Surfaces
    surfaceAaj: "आज — Today",
    surfaceVichara: "विचारा — Ask",
    surfaceKriya: "क्रिया — Actions",
    surfaceGrahak: "ग्राहक — Customers",
    surfaceMaalPaisa: "माल आणि पैसा — Stock & Money",
    toolWhatIf: "What-If Lab (सिम्युलेटर)",
    toolStockRescue: "Dead Stock Rescue",
    navSettings: "सेटिंग्ज (Settings)",
    navHelp: "मदत आणि सपोर्ट (Help)",
    mainNavHeading: "मुख्य दालन",
    toolsHeading: "बिझनेस टूल्स",

    // Surface Sub-titles
    surfaceAajSub: "दैनिक विक्री, उद्याची बँक जमा व ३ महत्त्वाचे निर्णय",
    surfaceVicharaSub: "व्हॉइस व मजकूर रिटेल सहाय्यक",
    surfaceKriyaSub: "निर्णय मंजुरी, थेट अंमलबजावणी व निकाल",
    surfaceGrahakSub: "गेलेले ग्राहक, सण मोहीम व ग्राहक वाढ",
    surfaceMaalPaisaSub: "कमी साठा, ONDC खरेदी व खेळते भांडवल",

    // Business Risk Indicator (Improvement 1)
    businessRiskTitle: "तातडीचा व्यावसायिक धोका",
    businessRiskBadge: "तातडीचे लक्ष आवश्यक",
    businessRiskIssue: "देशी गायीच्या तूपाचा (१L) साठा गुरुवारी पूर्ण संपेल. धनत्रयोदशीच्या काळात ग्राहक रिकाम्या हाताने परत जाण्याची शक्यता.",
    businessRiskImpactLabel: "धोक्यात असलेली सण विक्री:",
    businessRiskImpactVal: "₹२८,५००",
    businessRiskActionBtn: "आत्ताच ONDC वरून ४५ लिटर मागवा →",

    // 4 Financial Cards
    todaysSalesTitle: "आजची एकूण विक्री",
    todaysSalesDetail: "७१ ऑर्डर्स (QR व साउंडबॉक्स)",
    todaysSalesGrowth: "+६.९%",

    tomorrowDepositTitle: "उद्या बँकेत जमा",
    tomorrowDepositDetail: "सकाळी ७:०० पर्यंत थेट बँक वर्ग",
    tomorrowDepositTime: "सकाळी ०७:००",

    cashPositionTitle: "गल्ल्यातील रोख",
    cashPositionDetail: "काऊंटरवरील रोख व स्थानिक विक्री",
    cashPositionStatus: "अंदाजे गल्ला",

    gullakImpactTitle: "गुल्लक जास्तीची कमाई",
    gullakImpactDetail: "जुने ग्राहक व घाऊक बचतीतून नफा",
    gullakImpactStatus: "या आठवड्यात",

    // Today's Priorities (Strict Limit of 3)
    prioritiesTitle: "आजचे ३ प्राधान्यक्रम",
    prioritiesSub: "आज दुकानात सर्वात मोठा फरक पाडणाऱ्या ३ महत्त्वाच्या गोष्टी",
    activePrioritiesCount: "३ सक्रिय",

    priority1Title: "वेगाने खपणारा सण माल पुन्हा मागवा",
    priority1Badge: "तातडीचे",
    priority1Desc: "देशी गायीचे तूप (१L) आणि गोडेतेल पुढील २–३ दिवसांत संपेल. धनत्रयोदशीची खरेदी गुरुवारी सुरू होत आहे.",
    priority1Why: "गुल्लकने हा सल्ला का दिला? →",
    priority1Btn: "साठा तपासा व मागवा →",

    priority2Title: "६० जुन्या नियमित ग्राहकांशी संपर्क साधा",
    priority2Badge: "अंदाजे ₹८,०००–₹१२,०००",
    priority2Desc: "हे ६० ग्राहक गेल्या ३०+ दिवसांत आलेले नाहीत. त्यांच्यासाठी वैयक्तिक व्हॉट्सॲप सण सवलत मसुदा तयार आहे.",
    priority2Why: "ग्राहक यादी व माहिती →",
    priority2Btn: "ऑफर पहा व पाठवा →",

    priority3Title: "सणासाठी खेळते भांडवल संधी",
    priority3Badge: "₹५०,००० पूर्व-मंजूर",
    priority3Desc: "दैनंदिन ₹४०,०००+ साउंडबॉक्स विक्रीवर आधारित पूर्व-मंजूर क्रेडिट. दैनिक १.२% वजावटीसह सहज परतफेड.",
    priority3Why: "अटी व दैनिक परतफेड →",
    priority3Btn: "तपशील पहा →",

    // Right Rail - Trend & Soundbox
    velocityHeading: "व्यवसाय गती",
    trendHeading: "मागील ७ दिवसांची विक्री",
    trendWeeklyUplift: "+१२% या आठवड्यात",
    trendAvgDaily: "सरासरी: ₹६८,४०० / दिवस",
    trendTodaySales: "आज: ₹७४,०३६",
    trendDays: ["सोम", "मंगळ", "बुध", "गुरु", "शुक्र", "शनि", "रवि"],

    soundboxHardwareHeading: "साउंडबॉक्स 4G — सक्रिय",
    soundboxBriefTime: "सकाळी ८:०० घोषणा",
    soundboxAudioScript: "“शुभ प्रभात राजेशजी. कालची विक्री १२% जास्त झाली. देशी तूपाचा साठा कमी आहे. दोन महत्त्वाचे निर्णय आपल्या मंजुरीच्या प्रतीक्षेत आहेत.”",
    soundboxPlayBtn: "ऐका (Play)",
    soundboxShareBtn: "शेअर (Share)",

    // Ask Gullak Why (Improvement 2)
    askWhyTitle: "गुल्लकने ही शिफारस का केली? (व्यावसायिक पुरावा व हिशोब)",
    dataSources: "वापरलेली खरी माहिती (Live Soundbox POS)",
    formulaUsed: "हिशोबाचे सूत्र व गणित",
    assumptions: "गृहितके व जोखीम मर्यादा",

    // Action Receipts (Improvement 3)
    receiptTitle: "Paytm डिजिटल ॲक्शन पावती (Action Receipt)",
    receiptApprovedBy: "मंजूर करणारे",
    receiptTimestamp: "वेळ व मंजुरी पद्धत",
    receiptStatus: "अंमलबजावणी स्थिती",
    receiptEvidence: "माहितीचा आधार व पुरावा",
    receiptMeasuredOutcome: "प्रत्यक्ष मोजलेला नफा",
    hashSeal: "Paytm SHA-256 सुरक्षित डिजिटल सील",

    // Customer Offer Profit Guard (Improvement 4)
    profitGuardTitle: "ऑफर नफा रक्षक (Offer Profit Guard)",
    grossMarginLabel: "सूट दिलेल्या वस्तूंचे मार्जिन",
    discountRateLabel: "प्रस्तावित सवलत",
    broadcastCostLabel: "व्हॉट्सॲप मेसेज खर्च",
    breakevenOrdersLabel: "नफा सुरक्षिततेसाठी किमान ग्राहक",
    profitGuardVerdictSafe: "✓ नफा १००% सुरक्षित (मार्जिन फ्लोअर १४% वर)",

    // Stock & Money Safe to Spend (Improvement 5)
    reorderPlannerTitle: "स्मार्ट री-ऑर्डर प्लॅनर (Smart Reorder Planner)",
    safeToSpendTitle: "सुरक्षित खर्च मर्यादा (Safe-to-Spend)",
    totalAvailableFunds: "एकूण उपलब्ध रक्कम (रोख + उद्याची बँक जमा)",
    committedObligations: "राखीव देणी (पगार, भाडे, येणारे बिल)",
    safeSpendNet: "सध्या सुरक्षित खर्च करू शकता",
    deliveryLeadTime: "सप्लायर डिलिव्हरी वेळ: २४-३६ तास (ONDC)",

    // What-If Post-Execution (Improvement 6)
    forecastVsActualTitle: "अंदाज वि. प्रत्यक्ष निकाल पडताळणी",
    forecastedProfit: "अंदाजित नफा",
    actualProfit: "प्रत्यक्ष मिळालेला नफा",
    modelAccuracy: "मॉडेल अचूकता (९५.२%)",

    // Dead Stock Tiers (Improvement 7)
    slowMoving: "मंद गतीने खपणारा माल (Slow-Moving)",
    atRiskStock: "धोक्यात असलेला माल (At-Risk / Expiry)",
    deadStockTier: "अडकलेला डेड स्टॉक (Dead Stock 60+ दिवस)",
    capitalRecoveredTracker: "प्रत्यक्ष वसुली ट्रॅकर",

    // Premium Features (Improvement 10)
    businessMemory: "दुकान स्मरणशक्ती (Business Memory)",
    financialTwin: "डिजिटल आर्थिक ट्विन (Financial Twin)",
    businessRecoveryMode: "व्यावसायिक रिकव्हरी मोड (Recovery Mode)",
    neighborhoodIntelligence: "परिसर गुप्तवार्ता (Dadar Market)",

    // Kriya (Actions) Surface Tabs
    tabWaitingForYou: "मंजुरी बाकी",
    tabDone: "सुरू व पूर्ण",
    tabResults: "प्रत्यक्ष निकाल",
    advancedAuditToggle: "सुरक्षा व ऑडिट ट्रेल",
    auditValidBadge: "✓ सर्व ऑडिट नोंदी Paytm क्रिप्टोग्राफिक चेनद्वारे सुरक्षित आहेत",
    tamperTestButton: "टेम्पर टेस्ट",
    repairChainButton: "चेन रीस्टोर करा",

    // Grahak (Customers) Surface
    lapsedCustomersAlert: "६० जुने ग्राहक गेल्या ३०+ दिवसांत दुकानात आलेले नाहीत",
    draftWhatsAppOffer: "दिवाळी स्पेशल १०% सवलत व्हॉट्सॲप संदेश पाठवा",
    targetedLapsedSub: "या ग्राहकांनी यापूर्वी तूप किंवा मिठाई खरेदी केली होती",
    customerJourneyStep1: "१. ग्राहक वर्ग",
    customerJourneyStep2: "२. संदेश मसुदा",
    customerJourneyStep3: "३. मंजुरी",
    customerJourneyStep4: "४. निकाल",

    // Maal & Paisa Surface
    tabStock: "साठा व ONDC पुरवठादार",
    tabMoney: "पैसा व कल",
    gheeAlertHeadline: "दिवाळीपूर्वी गुरुवारी देशी तूपाचा साठा संपेल",
    reorderSuggestedAction: "महालक्ष्मी डिस्ट्रीब्यूटर्सकडून ४५ लिटर मागवा",
    availableSuppliers: "उपलब्ध घाऊक पुरवठादार (ONDC)",

    // Common
    doIt: "मंजूर करा",
    notNow: "आत्ता नको",
    orders: "ऑर्डर्स",
    avgTicket: "सरासरी खरेदी",
    perCustomer: "प्रति ग्राहक",
    urgent: "तातडीचे",
    loadingDashboard: "माहिती मिळवत आहे...",
    retry: "पुन्हा प्रयत्न करा",
    completed: "पूर्ण",
    pending: "प्रलंबित",
    rejected: "नाकारले"
  },

  hi: {
    // Brand & Header
    appSubtitle: "पेटीएम मर्चेंट AI बिज़नेस पार्टनर",
    soundboxActive: "साउंडबॉक्स 4G सक्रिय",
    soundboxLabel: "साउंडबॉक्स 4G",
    activeStatus: "सक्रिय",
    askGullak: "गुल्लक से पूछें",
    askGullakPlaceholder: "गुल्लक से कुछ भी पूछें... (उदा. 'कल कितने पैसे आएंगे', 'घी कब खत्म होगा')",
    toggleNav: "नेविगेशन",
    notifications: "सूचनाएं",
    hearSoundbox: "साउंडबॉक्स आवाज़ सुनें",
    soundboxBriefTitle: "Paytm साउंडबॉक्स दैनिक घोषणा",
    runBriefNow: "आज की ब्रीफिंग अभी सुनें",
    profileTitle: "दुकानदार प्रोफाइल व प्राइवेसी",
    devAppendix: "तकनीकी विवरण (Appendix)",

    // Greeting & Subtitle
    goodMorning: "शुभ प्रभात",
    merchantName: "राजेश कुमार",
    storeName: "श्री साई किराना एवं स्वीट्स",
    diwaliCountdown: "दिवाली ९ दिन में",
    storeLocation: "दादर मार्केट, मुंबई",
    merchantMotto: "छोटे कदम, बड़ी ग्रोथ.",

    // The 5 Core Surfaces
    surfaceAaj: "आज — Today",
    surfaceVichara: "पूछें — Ask",
    surfaceKriya: "क्रिया — Actions",
    surfaceGrahak: "ग्राहक — Customers",
    surfaceMaalPaisa: "माल और पैसा — Stock & Money",
    toolWhatIf: "What-If Lab (सिम्युलेटर)",
    toolStockRescue: "डेड स्टॉक रेस्क्यू",
    navSettings: "सेटिंग्स (Settings)",
    navHelp: "मदद और सपोर्ट (Help)",
    mainNavHeading: "मुख्य",
    toolsHeading: "बिज़नेस टूल्स",

    // Surface Sub-titles
    surfaceAajSub: "दैनिक बिक्री, कल का बैंक ट्रांसफर व ३ जरूरी फैसले",
    surfaceVicharaSub: "वॉइस और चैट रिटेल सहायक",
    surfaceKriyaSub: "मंज़ूरी, लाइव निष्पादन और परिणाम",
    surfaceGrahakSub: "पुराने ग्राहक, त्योहार कैंपेन और बिक्री वृद्धि",
    surfaceMaalPaisaSub: "कम स्टॉक, ONDC सप्लायर और वर्किंग कैपिटल",

    // Business Risk Indicator (Improvement 1)
    businessRiskTitle: "अति-आवश्यक व्यावसायिक जोखिम",
    businessRiskBadge: "तत्काल ध्यान दें",
    businessRiskIssue: "गाय के देसी घी (1L) का स्टॉक गुरुवार को पूरी तरह खत्म हो जाएगा। धनतेरस भीड़ में ग्राहक बिना सामान खरीदे लौट सकते हैं।",
    businessRiskImpactLabel: "जोखिम में त्योहार बिक्री:",
    businessRiskImpactVal: "₹२८,५००",
    businessRiskActionBtn: "अभी ONDC से ४५ लीटर का री-ऑर्डर करें →",

    // 4 Financial Cards
    todaysSalesTitle: "आज की कुल बिक्री",
    todaysSalesDetail: "७१ ऑर्डर्स (QR और साउंडबॉक्स)",
    todaysSalesGrowth: "+६.९%",

    tomorrowDepositTitle: "कल सुबह बैंक में जमा",
    tomorrowDepositDetail: "सुबह ७:०० बजे तक सीधे बैंक ट्रांसफर",
    tomorrowDepositTime: "सुबह ०७:००",

    cashPositionTitle: "गल्ले में नकद",
    cashPositionDetail: "काउंटर नकद व ऑफलाइन बिक्री",
    cashPositionStatus: "अनुमानित गल्ला",

    gullakImpactTitle: "गुल्लक अतिरिक्त लाभ",
    gullakImpactDetail: "पुराने ग्राहक वापसी व थोक बचत से लाभ",
    gullakImpactStatus: "इस हफ्ते",

    // Today's Priorities (Strict Limit of 3)
    prioritiesTitle: "आज की ३ प्राथमिकताएं",
    prioritiesSub: "आज दुकान में सबसे बड़ा फर्क डालने वाले ३ जरूरी काम",
    activePrioritiesCount: "३ सक्रिय",

    priority1Title: "तेज बिकने वाला सामान री-ऑर्डर करें",
    priority1Badge: "ज़रूरी",
    priority1Desc: "गाय का देसी घी (1L) और तेल अगले २-३ दिनों में खत्म हो जाएगा। धनतेरस की खरीदारी गुरुवार से शुरू हो रही है।",
    priority1Why: "गुल्लक ने यह सलाह क्यों दी? →",
    priority1Btn: "स्टॉक देखें व ऑर्डर करें →",

    priority2Title: "६० पुराने नियमित ग्राहकों से संपर्क करें",
    priority2Badge: "अनुमानित ₹८,०००–₹१२,०००",
    priority2Desc: "ये ६० ग्राहक पिछले ३०+ दिनों से नहीं आए हैं। इनके लिए व्हाट्सएप दिवाली स्पेशल ऑफर तैयार है।",
    priority2Why: "ग्राहक सूची व जानकारी →",
    priority2Btn: "ऑफर देखें व भेजें →",

    priority3Title: "त्योहार के लिए वर्किंग कैपिटल विकल्प",
    priority3Badge: "₹५०,००० प्री-अप्रूव्ड",
    priority3Desc: "दैनिक ₹४०,०००+ साउंडबॉक्स बिक्री पर आधारित प्री-अप्रूव्ड क्रेडिट। दैनिक १.२% कटौती के साथ आसान रीपेमेंट।",
    priority3Why: "शर्तें व दैनिक कटौती →",
    priority3Btn: "तपशील देखें →",

    // Right Rail - Trend & Soundbox
    velocityHeading: "बिजनेस गति",
    trendHeading: "पिछले ७ दिनों की बिक्री",
    trendWeeklyUplift: "+१२% इस हफ्ते",
    trendAvgDaily: "औसत: ₹६८,४०० / दिन",
    trendTodaySales: "आज: ₹७४,०३६",
    trendDays: ["सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि", "रवि"],

    soundboxHardwareHeading: "साउंडबॉक्स 4G — सक्रिय",
    soundboxBriefTime: "सुबह ८:०० घोषणा",
    soundboxAudioScript: "“शुभ प्रभात राजेश जी। कल की बिक्री १२% अधिक रही। देसी घी का स्टॉक कम है। दो जरूरी फैसलों पर आपकी मंजूरी बाकी है।”",
    soundboxPlayBtn: "सुनें (Play)",
    soundboxShareBtn: "शेयर (Share)",

    // Ask Gullak Why (Improvement 2)
    askWhyTitle: "गुल्लक ने यह सिफ़ारिश क्यों की? (व्यावसायिक प्रमाण व गणना)",
    dataSources: "उपयोग में लाया गया वास्तविक डेटा (Soundbox POS)",
    formulaUsed: "गणना का सूत्र व गणित",
    assumptions: "मान्यताएं व जोखिम सीमा",

    // Action Receipts (Improvement 3)
    receiptTitle: "Paytm डिजिटल एक्शन रसीद (Action Receipt)",
    receiptApprovedBy: "स्वीकृत कर्ता",
    receiptTimestamp: "स्वीकृति समय व चैनल",
    receiptStatus: "निष्पादन स्थिति",
    receiptEvidence: "जानकारी का आधार व साक्ष्य",
    receiptMeasuredOutcome: "वास्तविक मापा गया लाभ",
    hashSeal: "Paytm SHA-256 सुरक्षित डिजिटल मुहर",

    // Customer Offer Profit Guard (Improvement 4)
    profitGuardTitle: "ऑफर लाभ रक्षक (Offer Profit Guard)",
    grossMarginLabel: "छूट वाली वस्तुओं का ग्रॉस मार्जिन",
    discountRateLabel: "प्रस्तावित छूट दर",
    broadcastCostLabel: "व्हाट्सएप मैसेज लागत",
    breakevenOrdersLabel: "लागत वसूली के लिए न्यूनतम ग्राहक",
    profitGuardVerdictSafe: "✓ लाभ १००% सुरक्षित (मार्जिन फ्लोर १४% पर)",

    // Stock & Money Safe to Spend (Improvement 5)
    reorderPlannerTitle: "स्मार्ट री-ऑर्डर प्लानर (Smart Reorder Planner)",
    safeToSpendTitle: "सुरक्षित खर्च सीमा (Safe-to-Spend)",
    totalAvailableFunds: "कुल उपलब्ध राशि (नकद + कल की बैंक जमा)",
    committedObligations: "आरक्षित देनदारियां (वेतन, किराया, देय बिल)",
    safeSpendNet: "अभी सुरक्षित खर्च कर सकते हैं",
    deliveryLeadTime: "सप्लायर डिलीवरी समय: २४-३६ घंटे (ONDC)",

    // What-If Post-Execution (Improvement 6)
    forecastVsActualTitle: "अनुमान बनाम वास्तविक परिणाम सत्यापन",
    forecastedProfit: "अनुमानित लाभ",
    actualProfit: "वास्तविक अर्जित लाभ",
    modelAccuracy: "मॉडल सटीकता (९५.२%)",

    // Dead Stock Tiers (Improvement 7)
    slowMoving: "धीमी गति का स्टॉक (Slow-Moving)",
    atRiskStock: "जोखिमग्रस्त स्टॉक (At-Risk / Expiry)",
    deadStockTier: "फंसा हुआ डेड स्टॉक (Dead Stock 60+ दिन)",
    capitalRecoveredTracker: "वास्तविक वसूली ट्रैकर",

    // Premium Features (Improvement 10)
    businessMemory: "दुकान स्मरणशक्ति (Business Memory)",
    financialTwin: "डिजिटल वित्तीय ट्विन (Financial Twin)",
    businessRecoveryMode: "व्यावसायिक रिकवरी मोड (Recovery Mode)",
    neighborhoodIntelligence: "इलाका इंटेलिजेंस (Dadar Market)",

    // Kriya (Actions) Surface Tabs
    tabWaitingForYou: "मंज़ूरी बाकी",
    tabDone: "जारी व पूरे",
    tabResults: "वास्तविक परिणाम",
    advancedAuditToggle: "सुरक्षा व ऑडिट ट्रेल",
    auditValidBadge: "✓ सभी ऑडिट रिकॉर्ड Paytm क्रिप्टोग्राफिक चेन द्वारा सुरक्षित हैं",
    tamperTestButton: "टेम्पर टेस्ट",
    repairChainButton: "चेन रीस्टोर करें",

    // Grahak (Customers) Surface
    lapsedCustomersAlert: "६० पुराने ग्राहक पिछले ३०+ दिनों से दुकान पर नहीं आए हैं",
    draftWhatsAppOffer: "दिवाली स्पेशल १०% छूट का व्हाट्सएप मैसेज भेजें",
    targetedLapsedSub: "इन ग्राहकों ने पहले घी या मिठाई खरीदी थी",
    customerJourneyStep1: "१. ग्राहक वर्गीकरण",
    customerJourneyStep2: "२. मैसेज ड्राफ्ट",
    customerJourneyStep3: "३. मंज़ूरी",
    customerJourneyStep4: "४. वास्तविक परिणाम",

    // Maal & Paisa Surface
    tabStock: "स्टॉक व ONDC सप्लायर",
    tabMoney: "पैसा व रुझान",
    gheeAlertHeadline: "दिवाली से पहले गुरुवार को देसी घी खत्म होगा",
    reorderSuggestedAction: "महालक्ष्मी डिस्ट्रीब्यूटर्स से ४५ लीटर का ऑर्डर दें",
    availableSuppliers: "उपलब्ध थोक सप्लायर (ONDC)",

    // Common
    doIt: "मंज़ूर करें",
    notNow: "अभी नहीं",
    orders: "ऑर्डर्स",
    avgTicket: "औसत खरीद",
    perCustomer: "प्रति ग्राहक",
    urgent: "ज़रूरी",
    loadingDashboard: "डेटा लोड हो रहा है...",
    retry: "पुनः प्रयास करें",
    completed: "पूरा हुआ",
    pending: "लंबित",
    rejected: "अस्वीकृत"
  },

  en: {
    // Brand & Header
    appSubtitle: "Paytm Merchant AI Business Partner",
    soundboxActive: "Soundbox 4G Active",
    soundboxLabel: "Soundbox 4G",
    activeStatus: "Active",
    askGullak: "Ask Gullak",
    askGullakPlaceholder: "Ask Gullak anything... (e.g. 'Tomorrow deposit', 'Low stock alert')",
    toggleNav: "Toggle navigation",
    notifications: "Notifications",
    hearSoundbox: "Hear Soundbox",
    soundboxBriefTitle: "Paytm Soundbox Daily Brief",
    runBriefNow: "Run Today's Brief Now",
    profileTitle: "Store Profile & Privacy",
    devAppendix: "Dev Appendix",

    // Greeting & Subtitle
    goodMorning: "Good Morning",
    merchantName: "Rajesh Kumar",
    storeName: "Shree Sai Kirana & Sweets",
    diwaliCountdown: "Diwali in 9 days",
    storeLocation: "Dadar Market, Mumbai",
    merchantMotto: "Chhote kadam, badi growth.",

    // The 5 Core Surfaces
    surfaceAaj: "Today (Home)",
    surfaceVichara: "Ask Gullak",
    surfaceKriya: "Actions",
    surfaceGrahak: "Customers",
    surfaceMaalPaisa: "Stock & Money",
    toolWhatIf: "What-If Lab",
    toolStockRescue: "Dead Stock Rescue",
    navSettings: "Settings",
    navHelp: "Help & Support",
    mainNavHeading: "Main",
    toolsHeading: "Tools",

    // Surface Sub-titles
    surfaceAajSub: "Daily sales, tomorrow's bank deposit & top 3 priorities",
    surfaceVicharaSub: "Voice and chat merchant co-pilot",
    surfaceKriyaSub: "Approvals, live execution & measured results",
    surfaceGrahakSub: "Lapsed customers, festive campaigns & growth",
    surfaceMaalPaisaSub: "Low stock, ONDC orders & working capital",

    // Business Risk Indicator (Improvement 1)
    businessRiskTitle: "Urgent Business Risk",
    businessRiskBadge: "Action Required",
    businessRiskIssue: "Pure Desi Cow Ghee (1L) will run out on Thursday before Diwali. Peak Dhanteras shoppers will return empty-handed.",
    businessRiskImpactLabel: "Festive Sales at Risk:",
    businessRiskImpactVal: "₹28,500",
    businessRiskActionBtn: "Reorder 45L via ONDC Wholesale Now →",

    // 4 Financial Cards
    todaysSalesTitle: "Today's Sales",
    todaysSalesDetail: "71 orders via QR & Soundbox",
    todaysSalesGrowth: "+6.9%",

    tomorrowDepositTitle: "Bank Deposit",
    tomorrowDepositDetail: "Direct bank transfer tomorrow",
    tomorrowDepositTime: "07:00 AM",

    cashPositionTitle: "Cash Position",
    cashPositionDetail: "Till cash + offline counter sales",
    cashPositionStatus: "Estimated",

    gullakImpactTitle: "Gullak Impact",
    gullakImpactDetail: "From stock savings & win-backs",
    gullakImpactStatus: "This Week",

    // Today's Priorities (Strict Limit of 3)
    prioritiesTitle: "Today's priorities",
    prioritiesSub: "3 things that can make the biggest difference today",
    activePrioritiesCount: "3 active",

    priority1Title: "Restock fast-moving festival items",
    priority1Badge: "High Priority",
    priority1Desc: "Milk, biscuits and oil may run out in 2–3 days. Pure Desi Cow Ghee (45L) needed for Diwali Dhanteras rush.",
    priority1Why: "Why Gullak recommends this →",
    priority1Btn: "Review & Order →",

    priority2Title: "Reach 60 regular customers",
    priority2Badge: "Est. ₹8,000–₹12,000",
    priority2Desc: "Customers haven't visited in 30+ days. A pre-calculated Diwali festive offer is ready to broadcast.",
    priority2Why: "Why Gullak recommends this →",
    priority2Btn: "Preview offer →",

    priority3Title: "Festival stock working capital option",
    priority3Badge: "₹50,000 Pre-approved",
    priority3Desc: "You qualify for a ₹50,000 working-capital option. Repay effortlessly via 1.2% daily settlement deduction.",
    priority3Why: "Why Gullak recommends this →",
    priority3Btn: "Review terms →",

    // Right Rail - Trend & Soundbox
    velocityHeading: "Business Velocity",
    trendHeading: "Sales trend (Past 7 Days)",
    trendWeeklyUplift: "+12% this week",
    trendAvgDaily: "Avg: ₹68,400 / day",
    trendTodaySales: "Today: ₹74,036",
    trendDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],

    soundboxHardwareHeading: "Soundbox 4G — Active",
    soundboxBriefTime: "8:00 AM Briefing",
    soundboxAudioScript: "“Good morning Rajesh ji. Yesterday sales were up 12%. Cow Ghee stock low. Two actions need your review.”",
    soundboxPlayBtn: "Play briefing",
    soundboxShareBtn: "Share",

    // Ask Gullak Why (Improvement 2)
    askWhyTitle: "Why Gullak Recommends This (Evidence & Calculations)",
    dataSources: "Actual Business Data Used (Live Soundbox POS)",
    formulaUsed: "Mathematical Formula & Calculations",
    assumptions: "Assumptions & Confidence Bounds",

    // Action Receipts (Improvement 3)
    receiptTitle: "Paytm Verified Action Receipt",
    receiptApprovedBy: "Approved By",
    receiptTimestamp: "Approval Timestamp & Channel",
    receiptStatus: "Execution Status",
    receiptEvidence: "Supporting Evidence & Signals",
    receiptMeasuredOutcome: "Measured Net Profit Uplift",
    hashSeal: "Paytm SHA-256 Cryptographic Digital Seal",

    // Customer Offer Profit Guard (Improvement 4)
    profitGuardTitle: "Offer Profit Guard",
    grossMarginLabel: "Item Gross Margin",
    discountRateLabel: "Proposed Discount Rate",
    broadcastCostLabel: "WhatsApp Broadcast Cost",
    breakevenOrdersLabel: "Breakeven Orders Threshold",
    profitGuardVerdictSafe: "✓ PROFIT GUARANTEED (Margin Floor Protected > 14%)",

    // Stock & Money Safe to Spend (Improvement 5)
    reorderPlannerTitle: "Smart Reorder Planner",
    safeToSpendTitle: "Safe-to-Spend Limit",
    totalAvailableFunds: "Total Available Funds (Cash + Settlement)",
    committedObligations: "Committed Obligations (Salaries & Bills)",
    safeSpendNet: "Net Safe-to-Spend Right Now",
    deliveryLeadTime: "Supplier Delivery Lead Time: 24-36 Hours (ONDC)",

    // What-If Post-Execution (Improvement 6)
    forecastVsActualTitle: "Forecast vs. Actual Post-Execution Analysis",
    forecastedProfit: "Forecasted Uplift",
    actualProfit: "Actual Realized Uplift",
    modelAccuracy: "Model Accuracy (95.2%)",

    // Dead Stock Tiers (Improvement 7)
    slowMoving: "Slow-Moving Stock",
    atRiskStock: "At-Risk / Seasonal Expiry",
    deadStockTier: "Trapped Dead Stock (60+ Days Inactive)",
    capitalRecoveredTracker: "Actual Capital Recovered Tracker",

    // Premium Features (Improvement 10)
    businessMemory: "Store Business Memory",
    financialTwin: "Financial Twin (14-Day Model)",
    businessRecoveryMode: "Business Recovery Mode",
    neighborhoodIntelligence: "Neighborhood Intelligence (Dadar Market)",

    // Kriya (Actions) Surface Tabs
    tabWaitingForYou: "Waiting for you",
    tabDone: "Done & In Progress",
    tabResults: "Results",
    advancedAuditToggle: "Advanced Security & Audit Chain",
    auditValidBadge: "✓ All events verified & secured by Paytm cryptographic hash chain",
    tamperTestButton: "Tamper Test",
    repairChainButton: "Repair Chain",

    // Grahak (Customers) Surface
    lapsedCustomersAlert: "60 inactive customers haven't visited in 30+ days",
    draftWhatsAppOffer: "Send 10% Diwali offer WhatsApp broadcast",
    targetedLapsedSub: "These customers previously bought Ghee or festive sweets",
    customerJourneyStep1: "1. Segment",
    customerJourneyStep2: "2. Draft Offer",
    customerJourneyStep3: "3. Approve",
    customerJourneyStep4: "4. Results",

    // Maal & Paisa Surface
    tabStock: "Stock & ONDC Suppliers",
    tabMoney: "Money & Trends",
    gheeAlertHeadline: "Pure Desi Cow Ghee will run out Thursday before Diwali",
    reorderSuggestedAction: "Reorder 45 Litres from Mahalaxmi Wholesale",
    availableSuppliers: "Available Wholesale Suppliers (ONDC)",

    // Common
    doIt: "Approve / Do it",
    notNow: "Not now",
    orders: "Orders",
    avgTicket: "Avg ticket",
    perCustomer: "per customer",
    urgent: "Urgent",
    loadingDashboard: "Fetching data...",
    retry: "Retry",
    completed: "Completed",
    pending: "Pending",
    rejected: "Rejected"
  }
};
