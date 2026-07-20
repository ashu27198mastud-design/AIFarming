export type LanguageCode = 'hi' | 'en' | 'mr';

export type TranslationSet = {
  title: string;
  tagline: string;
  home: string;
  weather: string;
  mandi: string;
  myFarm: string;
  takePhoto: string;
  chooseGallery: string;
  analyzing: string;
  whatToDo: string;
  organicOption: string;
  chemicalOption: string;
  bestSpray: string;
  readAloud: string;
  stopSpeech: string;
  learnMore: string;
  savedScans: string;
  activeCrop: string;
  farmerName: string;
  noScans: string;
  gpsDenied: string;
  gpsSuccess: string;
  healthy: string;
  alert: string;
  diseased: string;
  unavailable: string;
  demoBanner: string;
  forecast: string;
  lastKnown: string;
  livePrice: string;
  loading: string;
  today: string;
  score: string;
  scoreDanger: string;
  scoreWarning: string;
  scoreGood: string;
  noMajorRisk: string;
  bestCrop: string;
  addFarmData: string;
  fertilizerPlan: string;
  mineral: string;
  timing: string;
  farmPlan: string;
  locationUpdated: string;
  locationUnavailable: string;
  cropDiseaseScan: string;
  captureOrUploadCropPhoto: string;
  photoGuidance: string;
  symptomStep: string;
  plantStep: string;
  lightStep: string;
  startLiveCamera: string;
  takePhonePhoto: string;
  uploadPhoto: string;
  openDeviceCamera: string;
  photoReady: string;
  removeImage: string;
  diagnosisDisclaimer: string;
  analyze: string;
  now: string;
  alerts: string;
  weatherUnavailable: string;
  browserAlertsUnavailable: string;
  notificationsBlocked: string;
  pushAlertsOn: string;
  enablePushAlerts: string;
  noMajorWeatherRisk: string;
  weatherRisksNotify: string;
  sevenDays: string;
  humidity: string;
  rain: string;
  nearestMarket: string;
  cropAdvice: string;
  nearby: string;
  liveMarketKeyMissing: string;
  sellReady: string;
  compareOrWait: string;
  stable: string;
  priceRisingAdvice: string;
  priceFallingAdvice: string;
  priceStableAdvice: string;
  liveSource: string;
  fallbackSource: string;
  quintal: string;
  flowering: string;
  hectareShort: string;
  langAutoSwitched: string;
  profileSetupTitle: string;
  profileSetupDesc: string;
  fullNameLabel: string;
  villageNameLabel: string;
  detectLocationBtn: string;
  detectingLocation: string;
  privacyConsent: string;
  completeSetupBtn: string;
  setupRequiredFields: string;
  authCompleting: string;
  authFailed: string;
  returnToLogin: string;
  gpsDetectedToast: string;
  setupStep1Title: string;
  setupStep2Title: string;
  setupStep3Title: string;
  nextBtn: string;
  proofLines: string[];
};

export const LANGUAGES: { code: LanguageCode; name: string }[] = [
  { code: 'hi', name: 'हिन्दी' },
  { code: 'en', name: 'English' },
  { code: 'mr', name: 'मराठी' },
];

export const TRANSLATIONS: Record<LanguageCode, TranslationSet> = {
  hi: {
    title: 'किसानमित्र',
    tagline: 'आपकी फसल का साथी',
    home: 'घर',
    weather: 'मौसम',
    mandi: 'मंडी भाव',
    myFarm: 'मेरा खेत',
    takePhoto: 'फसल की फोटो लें',
    chooseGallery: 'गैलरी से चुनें',
    analyzing: 'आपकी फसल देखी जा रही है...',
    whatToDo: 'क्या करें',
    organicOption: 'जैविक उपचार',
    chemicalOption: 'रासायनिक उपचार',
    bestSpray: 'दवा का सही समय',
    readAloud: 'बोलकर सुनाएं',
    stopSpeech: 'आवाज रोकें',
    learnMore: 'और जानें',
    savedScans: 'पुराने स्कैन इतिहास',
    activeCrop: 'सक्रिय फसल',
    farmerName: 'किसान: आशा पवार',
    noScans: 'कोई पुराना इतिहास नहीं मिला',
    gpsDenied: 'GPS अनुमति नहीं मिली',
    gpsSuccess: 'स्थान मिला',
    healthy: 'स्वस्थ',
    alert: 'ध्यान दें',
    diseased: 'बीमारी',
    unavailable: 'विश्लेषण उपलब्ध नहीं',
    demoBanner: 'डेमो परिणाम - लाइव AI उपलब्ध नहीं',
    forecast: '7 दिनों का पूर्वानुमान',
    lastKnown: 'अंतिम ज्ञात भाव',
    livePrice: 'लाइव मंडी भाव',
    loading: 'लोड हो रहा है...',
    today: 'आज',
    score: 'स्कोर',
    scoreDanger: 'धोका',
    scoreWarning: 'सावधान',
    scoreGood: 'उत्तम',
    noMajorRisk: 'बड़ा जोखिम नहीं',
    bestCrop: 'बेहतर फसल',
    addFarmData: 'खेत की जानकारी जोड़ें',
    fertilizerPlan: 'उर्वरक योजना',
    mineral: 'खनिज',
    timing: 'समय',
    farmPlan: 'खेत योजना',
    locationUpdated: 'स्थान अपडेट हुआ',
    locationUnavailable: 'स्थान उपलब्ध नहीं',
    cropDiseaseScan: 'फसल रोग जांच',
    captureOrUploadCropPhoto: 'फसल की फोटो लें या अपलोड करें',
    photoGuidance: 'प्रभावित पत्ती, तना, फल या पूरे पौधे की साफ और पास से फोटो लें। ऐप संभावित रोग, लक्षण, गंभीरता और अगला कदम बताएगा।',
    symptomStep: '1. लक्षण का क्लोज-अप',
    plantStep: '2. संभव हो तो पूरा पौधा',
    lightStep: '3. अच्छी रोशनी, धुंधलापन नहीं',
    startLiveCamera: 'लाइव कैमरा शुरू करें',
    takePhonePhoto: 'फोन से फोटो लें',
    uploadPhoto: 'फोटो अपलोड करें',
    openDeviceCamera: 'डिवाइस कैमरा खोलें',
    photoReady: 'फोटो तैयार है। रोग, गंभीरता, दिखे हुए संकेत और अगला कदम समझने के लिए जांच करें।',
    removeImage: 'फोटो हटाएं',
    diagnosisDisclaimer: 'यह जांच केवल मार्गदर्शन है। गंभीर मामलों में स्थानीय कृषि विशेषज्ञ से पुष्टि करें।',
    analyze: 'जांच करें',
    now: 'अभी',
    alerts: 'अलर्ट',
    weatherUnavailable: 'मौसम उपलब्ध नहीं',
    browserAlertsUnavailable: 'ब्राउज़र अलर्ट उपलब्ध नहीं',
    notificationsBlocked: 'नोटिफिकेशन बंद हैं',
    pushAlertsOn: 'पुश अलर्ट चालू',
    enablePushAlerts: 'पुश अलर्ट चालू करें',
    noMajorWeatherRisk: 'मौसम का बड़ा जोखिम नहीं',
    weatherRisksNotify: 'नया मौसम डेटा आने पर यह ब्राउज़र जोखिम की सूचना देगा।',
    sevenDays: '7 दिन',
    humidity: 'नमी',
    rain: 'बारिश',
    nearestMarket: 'नजदीकी मंडी',
    cropAdvice: 'फसल सलाह',
    nearby: 'आस-पास',
    liveMarketKeyMissing: 'अभी ताज़ा मंडी भाव उपलब्ध नहीं हैं। अंतिम भरोसेमंद भाव के आधार पर सलाह दिख रही है।',
    sellReady: 'बेचने योग्य',
    compareOrWait: 'तुलना करें या रुकें',
    stable: 'स्थिर',
    priceRisingAdvice: 'भाव बढ़ रहा है। फसल तैयार हो तो नजदीकी मंडियों की तुलना करें और छोटे लॉट में बेचें।',
    priceFallingAdvice: 'भाव गिर रहा है। दूसरी मंडी से तुलना करें, फसल की ग्रेडिंग करें, या शेल्फ लाइफ सुरक्षित हो तभी रुकें।',
    priceStableAdvice: 'भाव स्थिर है। कटाई की तैयारी, परिवहन खर्च और मौसम जोखिम देखकर बेचें।',
    liveSource: 'सरकारी मंडी डेटा से ताज़ा भाव, हर 6 घंटे में अपडेट।',
    fallbackSource: 'अंतिम भरोसेमंद मंडी भाव दिखाए जा रहे हैं। बेचने से पहले नजदीकी मंडी से भाव की पुष्टि करें।',
    quintal: 'क्विंटल',
    flowering: 'फूल अवस्था',
    hectareShort: 'हे.',
    langAutoSwitched: 'स्थान के अनुसार भाषा बदलकर मराठी की गई।',
    profileSetupTitle: 'प्रोफाइल सेटअप',
    profileSetupDesc: 'मौसम और फसल की सटीक जानकारी के लिए अपना नाम और गाँव दर्ज करें।',
    fullNameLabel: 'पूरा नाम',
    villageNameLabel: 'गाँव का नाम',
    detectLocationBtn: 'स्थान खोजें',
    detectingLocation: 'खोज रहे हैं...',
    privacyConsent: 'मैं अपना स्थान और प्रोफाइल जानकारी साझा करने के लिए सहमत हूँ।',
    completeSetupBtn: 'सेटअप पूरा करें',
    setupRequiredFields: 'नाम और गाँव दोनों आवश्यक हैं।',
    authCompleting: 'Google \u0932\u0949\u0917\u093f\u0928 \u092a\u0942\u0930\u093e \u0915\u0930 \u0930\u0939\u0947 \u0939\u0948\u0902...',
    authFailed: 'Google \u0932\u0949\u0917\u093f\u0928 \u092a\u0942\u0930\u093e \u0928\u0939\u0940\u0902 \u0939\u0941\u0906\u0964 \u092b\u093f\u0930 \u0915\u094b\u0936\u093f\u0936 \u0915\u0930\u0947\u0902\u0964',
    returnToLogin: '\u0932\u0949\u0917\u093f\u0928 \u092a\u0930 \u0932\u094c\u091f\u0947\u0902',
    gpsDetectedToast: 'आपके स्थान के आधार पर भाषा सेट की गई।',
    setupStep1Title: 'आपका नाम?',
    setupStep2Title: 'आपका गांव / शहर?',
    setupStep3Title: 'खेत का स्थान सेट करें',
    nextBtn: 'आगे बढ़ें',
    proofLines: [
      'आज 2,40,000 किसानों ने सही फैसला लिया',
      'फसल स्कैन: 10 सेकंड में रोग की पहचान',
      'मंडी भाव: बेचो या रुको — हम बताएंगे',
    ],
  },
  en: {
    title: 'KisanMitra',
    tagline: "Your Crop's Companion",
    home: 'Home',
    weather: 'Weather',
    mandi: 'Mandi Prices',
    myFarm: 'My Farm',
    takePhoto: 'Take Crop Photo',
    chooseGallery: 'Choose from Gallery',
    analyzing: 'Analyzing your crop...',
    whatToDo: 'What to do',
    organicOption: 'Organic Treatment',
    chemicalOption: 'Chemical Treatment',
    bestSpray: 'Best Spray Window',
    readAloud: 'Read Aloud',
    stopSpeech: 'Stop Speech',
    learnMore: 'Learn More',
    savedScans: 'Past Scan History',
    activeCrop: 'Active Crop',
    farmerName: 'Farmer: Asha Pawar',
    noScans: 'No scan history found',
    gpsDenied: 'GPS permission denied',
    gpsSuccess: 'Location found',
    healthy: 'Healthy',
    alert: 'Attention',
    diseased: 'Disease',
    unavailable: 'Analysis unavailable',
    demoBanner: 'Demo result - live AI unavailable',
    forecast: '7-Day Forecast',
    lastKnown: 'Last known price',
    livePrice: 'Live mandi price',
    loading: 'Loading...',
    today: 'Today',
    score: 'Score',
    scoreDanger: 'Risk',
    scoreWarning: 'Caution',
    scoreGood: 'Good',
    noMajorRisk: 'No major risk',
    bestCrop: 'Best crop',
    addFarmData: 'Add farm data',
    fertilizerPlan: 'Fertiliser plan',
    mineral: 'Mineral',
    timing: 'Timing',
    farmPlan: 'Farm plan',
    locationUpdated: 'Location updated',
    locationUnavailable: 'Location unavailable',
    cropDiseaseScan: 'Crop disease scan',
    captureOrUploadCropPhoto: 'Capture or upload crop photo',
    photoGuidance: 'Take a close, clear photo of the affected leaf, stem, fruit, or whole plant. The app will explain the likely disease, visible signs, severity, and next steps.',
    symptomStep: '1. Close-up symptom',
    plantStep: '2. Full plant if possible',
    lightStep: '3. Good light, no blur',
    startLiveCamera: 'Start live camera',
    takePhonePhoto: 'Take phone photo',
    uploadPhoto: 'Upload photo',
    openDeviceCamera: 'Open device camera',
    photoReady: 'Photo ready. Tap Analyze to understand disease, severity, visible signs, and next action.',
    removeImage: 'Remove image',
    diagnosisDisclaimer: 'The diagnosis is guidance only. Confirm severe cases with a local agronomist.',
    analyze: 'Analyze',
    now: 'Now',
    alerts: 'Alerts',
    weatherUnavailable: 'Weather unavailable',
    browserAlertsUnavailable: 'Browser alerts unavailable',
    notificationsBlocked: 'Notifications blocked',
    pushAlertsOn: 'Push alerts on',
    enablePushAlerts: 'Enable push alerts',
    noMajorWeatherRisk: 'No major weather risk',
    weatherRisksNotify: 'Weather risks will notify this browser when new forecast data is loaded.',
    sevenDays: '7 days',
    humidity: 'humidity',
    rain: 'rain',
    nearestMarket: 'Nearest market',
    cropAdvice: 'Crop advice',
    nearby: 'Nearby',
    liveMarketKeyMissing: 'Fresh market prices are not available right now. Showing last trusted prices for decision support.',
    sellReady: 'Sell-ready',
    compareOrWait: 'Compare or wait',
    stable: 'Stable',
    priceRisingAdvice: 'Price trend is rising. If crop is mature, compare nearby markets and sell in smaller lots.',
    priceFallingAdvice: 'Price trend is falling. Compare another market, grade the crop, or wait only if shelf life is safe.',
    priceStableAdvice: 'Price is stable. Sell based on harvest maturity, transport cost, and weather risk.',
    liveSource: 'Fresh government mandi data, refreshed every 6 hours.',
    fallbackSource: 'Last trusted market prices shown. Confirm with the nearby mandi before selling.',
    quintal: 'quintal',
    flowering: 'Flowering',
    hectareShort: 'ha',
    langAutoSwitched: 'Language auto-switched to Marathi based on location.',
    profileSetupTitle: 'Profile Setup',
    profileSetupDesc: 'Enter your name and village to get personalized weather and crop advisory.',
    fullNameLabel: 'Full Name',
    villageNameLabel: 'Village Name',
    detectLocationBtn: 'Detect Location',
    detectingLocation: 'Detecting...',
    privacyConsent: 'I consent to sharing my location and profile details.',
    completeSetupBtn: 'Complete Setup',
    setupRequiredFields: 'Both name and village are required.',
    authCompleting: 'Completing Google login...',
    authFailed: 'Google login could not be completed. Please try again.',
    returnToLogin: 'Return to login',
    gpsDetectedToast: 'Language auto-set based on your location.',
    setupStep1Title: 'Your name?',
    setupStep2Title: 'Your village / city?',
    setupStep3Title: 'Set farm location',
    nextBtn: 'Next',
    proofLines: [
      'Today 2,40,000 farmers made the right decision',
      'Crop Scan: Disease identified in 10 seconds',
      'Mandi Price: Sell or Wait — we\'ll tell you',
    ],
  },
  mr: {
    title: 'किसानमित्र',
    tagline: 'तुमच्या पिकाचा सोबती',
    home: 'घर',
    weather: 'हवामान',
    mandi: 'बाजार भाव',
    myFarm: 'माझे शेत',
    takePhoto: 'पिकाचा फोटो घ्या',
    chooseGallery: 'गॅलरीतून निवडा',
    analyzing: 'तुमचे पीक तपासले जात आहे...',
    whatToDo: 'काय करावे',
    organicOption: 'सेंद्रिय उपचार',
    chemicalOption: 'रासायनिक उपचार',
    bestSpray: 'फवारणीची योग्य वेळ',
    readAloud: 'वाचून दाखवा',
    stopSpeech: 'आवाज थांबवा',
    learnMore: 'अधिक माहिती',
    savedScans: 'मागील स्कॅन इतिहास',
    activeCrop: 'सक्रिय पीक',
    farmerName: 'शेतकरी: आशा पवार',
    noScans: 'जुना इतिहास आढळला नाही',
    gpsDenied: 'GPS परवानगी नाकारली',
    gpsSuccess: 'स्थान सापडले',
    healthy: 'निरोगी',
    alert: 'काळजी घ्या',
    diseased: 'रोगग्रस्त',
    unavailable: 'विश्लेषण उपलब्ध नाही',
    demoBanner: 'डेमो निकाल - थेट AI उपलब्ध नाही',
    forecast: '7 दिवसांचा अंदाज',
    lastKnown: 'शेवटचा ज्ञात भाव',
    livePrice: 'थेट बाजार भाव',
    loading: 'लोड होत आहे...',
    today: 'आज',
    score: 'स्कोर',
    scoreDanger: 'धोका',
    scoreWarning: 'सावधान',
    scoreGood: 'उत्तम',
    noMajorRisk: 'मोठा धोका नाही',
    bestCrop: 'योग्य पीक',
    addFarmData: 'शेताची माहिती जोडा',
    fertilizerPlan: 'खत योजना',
    mineral: 'खनिज',
    timing: 'वेळ',
    farmPlan: 'शेत योजना',
    locationUpdated: 'स्थान अपडेट झाले',
    locationUnavailable: 'स्थान उपलब्ध नाही',
    cropDiseaseScan: 'पीक रोग तपासणी',
    captureOrUploadCropPhoto: 'पिकाचा फोटो घ्या किंवा अपलोड करा',
    photoGuidance: 'प्रभावित पान, खोड, फळ किंवा पूर्ण झाडाचा जवळून आणि स्पष्ट फोटो घ्या. ऐप संभाव्य रोग, लक्षणे, गंभीरता आणि पुढील पावले सांगेल.',
    symptomStep: '1. लक्षणाचा जवळचा फोटो',
    plantStep: '2. शक्य असल्यास पूर्ण झाड',
    lightStep: '3. चांगला प्रकाश, धूसर नाही',
    startLiveCamera: 'लाइव्ह कॅमेरा सुरू करा',
    takePhonePhoto: 'फोनने फोटो घ्या',
    uploadPhoto: 'फोटो अपलोड करा',
    openDeviceCamera: 'डिवाइस कॅमेरा उघडा',
    photoReady: 'फोटो तयार आहे. रोग, गंभीरता, दिसणारी लक्षणे आणि पुढचे पाऊल समजण्यासाठी तपासा.',
    removeImage: 'फोटो काढा',
    diagnosisDisclaimer: 'ही तपासणी फक्त मार्गदर्शन आहे. गंभीर प्रकरणात स्थानिक कृषी तज्ज्ञांकडून खात्री करा.',
    analyze: 'तपासा',
    now: 'आता',
    alerts: 'इशारे',
    weatherUnavailable: 'हवामान उपलब्ध नाही',
    browserAlertsUnavailable: 'ब्राउझर अलर्ट उपलब्ध नाहीत',
    notificationsBlocked: 'नोटिफिकेशन बंद आहेत',
    pushAlertsOn: 'पुश अलर्ट सुरू',
    enablePushAlerts: 'पुश अलर्ट सुरू करा',
    noMajorWeatherRisk: 'हवामानाचा मोठा धोका नाही',
    weatherRisksNotify: 'नवे हवामान डेटा आल्यावर हा ब्राउझर धोका कळवेल.',
    sevenDays: '7 दिवस',
    humidity: 'आर्द्रता',
    rain: 'पाऊस',
    nearestMarket: 'जवळची बाजारपेठ',
    cropAdvice: 'पीक सल्ला',
    nearby: 'जवळपास',
    liveMarketKeyMissing: 'सध्या ताजे बाजार भाव उपलब्ध नाहीत. शेवटच्या विश्वासार्ह भावावर आधारित सल्ला दाखवत आहोत.',
    sellReady: 'विक्रीस तयार',
    compareOrWait: 'तुलना करा किंवा थांबा',
    stable: 'स्थिर',
    priceRisingAdvice: 'भाव वाढत आहे. पीक तयार असल्यास जवळच्या बाजारांची तुलना करा आणि छोट्या लॉटमध्ये विक्री करा.',
    priceFallingAdvice: 'भाव घटत आहे. दुसऱ्या बाजाराशी तुलना करा, पिकाची ग्रेडिंग करा, किंवा टिकाऊपणा सुरक्षित असल्यासच थांबा.',
    priceStableAdvice: 'भाव स्थिर आहे. काढणीची तयारी, वाहतूक खर्च आणि हवामान धोका पाहून विक्री करा.',
    liveSource: 'सरकारी बाजार डेटावरून ताजे भाव, दर ६ तासांनी अपडेट.',
    fallbackSource: 'शेवटचे विश्वासार्ह बाजार भाव दाखवले आहेत. विक्रीपूर्वी जवळच्या बाजारपेठेत भाव खात्री करा.',
    quintal: 'क्विंटल',
    flowering: 'फुलोरा अवस्था',
    hectareShort: 'हे.',
    langAutoSwitched: 'स्थानानुसार भाषा मराठी करण्यात आली आहे.',
    gpsDetectedToast: 'स्थानानुसार भाषा मराठी करण्यात आली आहे.',
    setupStep1Title: 'तुमचं नाव?',
    setupStep2Title: 'तुमचं गाव / शहर?',
    setupStep3Title: 'शेताचं स्थान सेट करा',
    nextBtn: 'पुढे जा',
    profileSetupTitle: 'प्रोफाइल सेटअप',
    profileSetupDesc: 'अचूक हवामान आणि पीक सल्ला मिळवण्यासाठी तुमचे नाव आणि गाव प्रविष्ट करा.',
    fullNameLabel: 'पूर्ण नाव',
    villageNameLabel: 'गावाचे नाव',
    detectLocationBtn: 'स्थान शोधा',
    detectingLocation: 'शोधत आहे...',
    privacyConsent: 'मी माझे स्थान आणि प्रोफाइल तपशील सामायिक करण्यास सहमती देतो.',
    completeSetupBtn: 'सेटअप पूर्ण करा',
    setupRequiredFields: 'नाव आणि गाव दोन्ही आवश्यक आहेत.',
    authCompleting: 'Google \u0932\u0949\u0917\u093f\u0928 \u092a\u0942\u0930\u094d\u0923 \u0915\u0930\u0924 \u0906\u0939\u094b\u0924...',
    authFailed: 'Google \u0932\u0949\u0917\u093f\u0928 \u092a\u0942\u0930\u094d\u0923 \u091d\u093e\u0932\u0947 \u0928\u093e\u0939\u0940. \u092a\u0941\u0928\u094d\u0939\u093e \u092a\u094d\u0930\u092f\u0924\u094d\u0928 \u0915\u0930\u093e.',
    returnToLogin: '\u0932\u0949\u0917\u093f\u0928\u0935\u0930 \u092a\u0930\u0924 \u092f\u093e',
    proofLines: [
      'आज 2,40,000 शेतकऱ्यांनी योग्य निर्णय घेतला',
      'पीक स्कॅन: 10 सेकंदात रोगाची ओळख',
      'बाजार भाव: विका किंवा थांबा — आम्ही सांगू',
    ],
  },
};

export function resolveGpsToLanguage(lat: number, lng: number): LanguageCode {
  if (lat >= 15.6 && lat <= 22.0 && lng >= 72.6 && lng <= 80.9) return 'mr';
  return 'hi';
}

const GPS_MARKETS = [
  { state: 'Maharashtra', district: 'Nashik', lat: 19.9975, lng: 73.7898 },
  { state: 'Maharashtra', district: 'Pune', lat: 18.5204, lng: 73.8567 },
  { state: 'Maharashtra', district: 'Mumbai', lat: 19.076, lng: 72.8777 },
  { state: 'Maharashtra', district: 'Nagpur', lat: 21.1458, lng: 79.0882 },
  { state: 'Maharashtra', district: 'Ahmednagar', lat: 19.0948, lng: 74.748 },
  { state: 'Maharashtra', district: 'Solapur', lat: 17.6599, lng: 75.9064 },
  { state: 'Maharashtra', district: 'Kolhapur', lat: 16.705, lng: 74.2433 },
  { state: 'Maharashtra', district: 'Jalgaon', lat: 21.0077, lng: 75.5626 },
  { state: 'Maharashtra', district: 'Aurangabad', lat: 19.8762, lng: 75.3433 },
  { state: 'Gujarat', district: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  { state: 'Madhya Pradesh', district: 'Indore', lat: 22.7196, lng: 75.8577 },
  { state: 'Karnataka', district: 'Belgaum', lat: 15.8497, lng: 74.4977 },
] as const;

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const radians = (value: number) => value * Math.PI / 180;
  const dLat = radians(lat2 - lat1);
  const dLng = radians(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function resolveGpsMarket(lat: number, lng: number): { state: string; district: string; distanceKm: number } {
  const nearest = GPS_MARKETS
    .map((market) => ({ ...market, distanceKm: Math.round(distanceKm(lat, lng, market.lat, market.lng)) }))
    .sort((a, b) => a.distanceKm - b.distanceKm)[0];
  return { state: nearest.state, district: nearest.district, distanceKm: nearest.distanceKm };
}
