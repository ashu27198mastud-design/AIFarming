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
    whatToDo: 'क्या करें / What to do',
    organicOption: 'जैविक उपचार / Organic',
    chemicalOption: 'रासायनिक उपचार / Chemical',
    bestSpray: 'दवा कब डालें / Spray window',
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
    demoBanner: 'डेमो परिणाम — लाइव AI उपलब्ध नहीं / Demo result — live AI unavailable',
    forecast: '7 दिनों का पूर्वानुमान',
    lastKnown: 'अंतिम ज्ञात भाव / Last known price',
    livePrice: 'लाइव मंडी भाव / Live mandi price',
    loading: 'लोड हो रहा है...',
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
    demoBanner: 'डेमो परिणाम — लाइव AI उपलब्ध नहीं / Demo result — live AI unavailable',
    forecast: '7-Day Forecast',
    lastKnown: 'अंतिम ज्ञात भाव / Last known price',
    livePrice: 'लाइव मंडी भाव / Live mandi price',
    loading: 'Loading...',
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
    whatToDo: 'काय करावे / What to do',
    organicOption: 'सेंद्रिय उपचार / Organic',
    chemicalOption: 'रासायनिक उपचार / Chemical',
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
    demoBanner: 'डेमो निकाल — थेट AI उपलब्ध नाही / Demo result — live AI unavailable',
    forecast: '7 दिवसांचा अंदाज',
    lastKnown: 'शेवटचा ज्ञात भाव / Last known price',
    livePrice: 'थेट बाजार भाव / Live mandi price',
    loading: 'लोड होत आहे...',
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
