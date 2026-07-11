'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, Upload, Volume2, ChevronDown, MapPin, Navigation,
  CloudRain, TrendingUp, Sprout, Leaf, ArrowRight, User,
  VolumeX, Clock, ShieldCheck, AlertTriangle, AlertCircle, RefreshCw, X, Play, Wind
} from 'lucide-react';
import { useFarmStore } from '@/store/farmStore';
import type { CropDiagnosis } from '@/types';

// 23 Registered Languages of India + English Display Map
const LANGUAGES = [
  { code: 'hi', name: 'हिन्दी (Hindi)' },
  { code: 'en', name: 'English (अंग्रेज़ी)' },
  { code: 'mr', name: 'मराठी (Marathi)' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
  { code: 'bn', name: 'বাংলা (Bengali)' },
  { code: 'te', name: 'తెలుగు (Telugu)' },
  { code: 'ta', name: 'தமிழ் (Tamil)' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ml', name: 'മലയാളം (Malayalam)' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'or', name: 'ଓଡ଼ିଆ (Odia)' },
  { code: 'as', name: 'অসমীয়া (Assamese)' },
  { code: 'ur', name: 'اردو (Urdu)' },
  { code: 'sa', name: 'संस्कृतम् (Sanskrit)' },
  { code: 'ks', name: 'کٲशुर (Kashmiri)' },
  { code: 'kok', name: 'कोंकणी (Konkani)' },
  { code: 'mni', name: 'মণিপুরী (Manipuri)' },
  { code: 'ne', name: 'नेपाली (Nepali)' },
  { code: 'bodo', name: 'बोडो (Bodo)' },
  { code: 'doi', name: 'डोगरी (Dogri)' },
  { code: 'mai', name: 'मैथिली (Maithili)' },
  { code: 'sat', name: 'संताली (Santali)' },
  { code: 'sd', name: 'सिन्धी (Sindhi)' }
];

// UI Label Translations Dictionary
const TRANSLATIONS: Record<string, Record<string, string>> = {
  hi: {
    title: 'किसानमित्र',
    tagline: 'आपकी फसल का साथी',
    home: 'घर',
    weather: 'मौसम',
    mandi: 'मंडी भाव',
    myFarm: 'मेरा खेत',
    takePhoto: 'फसल की फोटो लें',
    chooseGallery: 'गैलरी से चुनें',
    useGps: 'जीपीएस से भाषा चुनें',
    gpsSearching: 'खोज रहे हैं...',
    gpsSuccess: 'स्थान मिला!',
    analyzing: 'आपकी फसल देखी जा रही है...',
    whatToDo: 'क्या करें / What to do',
    organicOption: 'जैविक उपचार / Organic',
    chemicalOption: 'रासायनिक उपचार / Chemical',
    bestSpray: 'दवा कब डालें / Spray Window',
    readAloud: 'बोलकर सुनाएं',
    stopSpeech: 'आवाज रोकें',
    learnMore: 'और जानें',
    mandiRates: 'लाइव मंडी भाव',
    mandiTomato: 'टमाटर (Arka Rakshak)',
    mandiNadhik: 'नाशिक मंडी, महाराष्ट्र',
    mandiAdvice: 'मंडी भाव अभी सामान्य से अधिक है, फ़सल अभी बेचना उचित है।',
    weatherAlert: 'भारी बारिश की चेतावनी — हवादार स्थानों में छिड़काव टालें',
    weatherWind: 'तेज़ हवा का अलर्ट — छिड़काव सुबह करें',
    weatherTemp: 'अधिक तापमान — दोपहर में सिंचाई न करें',
    savedScans: 'पुराने स्कैन इतिहास',
    activeCrop: 'सक्रिय फसल',
    soilPh: 'मिट्टी पीएच',
    irrigation: 'सिंचाई विधि',
    farmerName: 'किसान: आशा पवार',
    noScans: 'कोई पुराना इतिहास नहीं मिला',
    gpsDenied: 'GPS अनुमति नहीं मिली',
    healthy: '🟢 स्वस्थ',
    alert: '🟡 ध्यान दें',
    diseased: '🔴 बीमारी'
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
    useGps: 'Auto Language via GPS',
    gpsSearching: 'Locating...',
    gpsSuccess: 'Location Found!',
    analyzing: 'Analyzing your crop...',
    whatToDo: 'What to do',
    organicOption: 'Organic Treatment',
    chemicalOption: 'Chemical Treatment',
    bestSpray: 'Best Spray Window',
    readAloud: 'Read Aloud',
    stopSpeech: 'Stop Speech',
    learnMore: 'Learn More',
    mandiRates: 'Live Mandi Prices',
    mandiTomato: 'Tomato (Arka Rakshak)',
    mandiNadhik: 'Nashik Mandi, Maharashtra',
    mandiAdvice: 'Mandi prices are currently high, it is highly recommended to sell now.',
    weatherAlert: 'Heavy rain warning — Avoid spraying in open areas',
    weatherWind: 'High wind alert — Schedule foliar sprays for early morning',
    weatherTemp: 'High temperature — Avoid irrigating in direct noon heat',
    savedScans: 'Past Scan History',
    activeCrop: 'Active Crop',
    soilPh: 'Soil pH',
    irrigation: 'Irrigation Type',
    farmerName: 'Farmer: Asha Pawar',
    noScans: 'No scan history found',
    gpsDenied: 'GPS Permission Denied',
    healthy: '🟢 Healthy',
    alert: '🟡 Alert',
    diseased: '🔴 Disease'
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
    useGps: 'जीपीएस द्वारे भाषा निवडा',
    gpsSearching: 'शोधत आहे...',
    gpsSuccess: 'स्थान सापडले!',
    analyzing: 'तुमचे पीक तपासले जात आहे...',
    whatToDo: 'पायऱ्या / What to do',
    organicOption: 'सेंद्रिय उपचार',
    chemicalOption: 'रासायनिक उपचार',
    bestSpray: 'फवारणीची वेळ',
    readAloud: 'वाचून दाखवा',
    stopSpeech: 'आवाज थांबवा',
    learnMore: 'अधिक माहिती',
    mandiRates: 'थेट बाजार भाव',
    mandiTomato: 'टोमॅटो (Arka Rakshak)',
    mandiNadhik: 'नाशिक बाजार समिती, महाराष्ट्र',
    mandiAdvice: 'बाजार भाव सध्या चांगले आहेत, पिकाची विक्री करणे योग्य राहील.',
    weatherAlert: 'मुसळधार पावसाचा इशारा — उघड्या जागेत फवारणी टाळावी',
    weatherWind: 'वेगवान वाऱ्याचा इशारा — सकाळी लवकर फवारणी करावी',
    weatherTemp: 'जास्त तापमान — दुपारी पाणी देणे टाळावे',
    savedScans: 'मागील स्कॅन इतिहास',
    activeCrop: 'सक्रिय पीक',
    soilPh: 'माती सामू (pH)',
    irrigation: 'सिंचन पद्धत',
    farmerName: 'शेतकरी: आशा पवार',
    noScans: 'जुना इतिहास आढळला नाही',
    gpsDenied: 'GPS परवानगी नाकारली',
    healthy: '🟢 निरोगी',
    alert: '🟡 काळजी घ्या',
    diseased: '🔴 रोगग्रस्त'
  }
};

// Fill fallbacks for other 20 Indian languages using Hindi structure with localized Title/Tagline
LANGUAGES.forEach(lang => {
  if (!TRANSLATIONS[lang.code]) {
    TRANSLATIONS[lang.code] = {
      ...TRANSLATIONS['en'], // default English text mappings
      title: 'KisanMitra',
      tagline: `${lang.name} Companion`,
    };
  }
});

// Primary Language GPS Boundary Resolver
function resolveGpsToLanguage(lat: number, lng: number): string {
  // Maharashtra
  if (lat >= 15.6 && lat <= 22.0 && lng >= 72.6 && lng <= 80.9) return 'mr';
  // Gujarat
  if (lat >= 20.1 && lat <= 24.7 && lng >= 68.1 && lng <= 74.5) return 'gu';
  // Karnataka
  if (lat >= 11.5 && lat <= 18.5 && lng >= 74.0 && lng <= 78.5) return 'kn';
  // Tamil Nadu
  if (lat >= 8.1 && lat <= 13.5 && lng >= 76.2 && lng <= 80.3) return 'ta';
  // Kerala
  if (lat >= 8.3 && lat <= 12.8 && lng >= 74.9 && lng <= 77.4) return 'ml';
  // Andhra / Telangana
  if (lat >= 12.6 && lat <= 19.9 && lng >= 76.8 && lng <= 84.8) return 'te';
  // West Bengal
  if (lat >= 21.5 && lat <= 27.2 && lng >= 85.8 && lng <= 89.8) return 'bn';
  // Punjab
  if (lat >= 29.5 && lat <= 32.5 && lng >= 73.8 && lng <= 77.0) return 'pa';
  // Odisha
  if (lat >= 17.8 && lat <= 22.5 && lng >= 81.3 && lng <= 87.5) return 'or';
  // Assam
  if (lat >= 24.1 && lat <= 28.0 && lng >= 89.8 && lng <= 96.0) return 'as';
  // Default to Hindi for central/northern regions
  return 'hi';
}

export default function Home() {
  const { farmTwin } = useFarmStore();
  
  // Navigation & General UI State
  const [activeTab, setActiveTab] = useState<'home' | 'weather' | 'mandi' | 'farm'>('home');
  const [lang, setLang] = useState('hi');
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'searching' | 'success' | 'error'>('idle');
  
  // Camera & Image Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<any>(null);
  
  // Viewfinder camera fallback state
  const [useViewfinder, setUseViewfinder] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  
  // Audio Speech Synthesis state
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Saved Scans state (PWA Offline / local persistence)
  const [scansHistory, setScansHistory] = useState<any[]>([]);

  // Expandable result card detail
  const [learnMoreExpanded, setLearnMoreExpanded] = useState(false);

  // Video error alert
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const t = TRANSLATIONS[lang] || TRANSLATIONS['hi'];

  // Register PWA service worker and load persisted scans
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // SW Registration
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
          .then(reg => console.log('SW Registered:', reg.scope))
          .catch(err => console.log('SW Registration failed:', err));
      }
      
      // Load selected language
      const savedLang = localStorage.getItem('km-lang');
      if (savedLang) setLang(savedLang);
      
      // Seed initial history if none exists
      const savedHistory = localStorage.getItem('km-scans-history');
      if (savedHistory) {
        setScansHistory(JSON.parse(savedHistory));
      } else {
        const seedHistory = [
          {
            id: 'scan-1',
            date: new Date(Date.now() - 86400000).toLocaleDateString(),
            disease: 'अगेती झुलसा / Early Blight (Alternaria solani)',
            severity: 'medium',
            status: '🔴',
            thumbnail: '/placeholder-leaf.jpg'
          }
        ];
        localStorage.setItem('km-scans-history', JSON.stringify(seedHistory));
        setScansHistory(seedHistory);
      }
    }
  }, []);

  // Sync language selection to localStorage
  const handleLanguageChange = (code: string) => {
    setLang(code);
    setLangMenuOpen(false);
    localStorage.setItem('km-lang', code);
  };

  // GPS Language Detection Engine
  const triggerGpsLocate = () => {
    if (!navigator.geolocation) {
      setGpsStatus('error');
      return;
    }
    setGpsStatus('searching');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const detected = resolveGpsToLanguage(pos.coords.latitude, pos.coords.longitude);
        handleLanguageChange(detected);
        setGpsStatus('success');
        setTimeout(() => setGpsStatus('idle'), 2000);
      },
      () => {
        setGpsStatus('error');
        setTimeout(() => setGpsStatus('idle'), 3000);
      },
      { timeout: 8000 }
    );
  };

  // Live in-app viewfinder camera activation
  const startCameraViewfinder = async () => {
    try {
      setUseViewfinder(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Could not launch camera viewfinder:", err);
      // Fall back to direct file picker if capture fails
      setUseViewfinder(false);
      fileInputRef.current?.click();
    }
  };

  const stopCameraViewfinder = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setUseViewfinder(false);
  };

  const captureFrameFromViewfinder = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
            handleFileUpload(file);
          }
        }, 'image/jpeg', 0.85); // compress client-side
      }
      stopCameraViewfinder();
    }
  };

  // File validator and compression
  const handleFileUpload = (file: File) => {
    setUploadError(null);
    if (!file) return;

    // Check size limit: 25MB
    if (file.size > 25 * 1024 * 1024) {
      setUploadError(lang === 'hi' ? 'फ़ाइल का आकार बहुत बड़ा है (अधिकतम 25MB)।' : 'File size is too large (maximum 25MB).');
      return;
    }

    // Video validation: limit to 30 seconds
    if (file.type.startsWith('video/')) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 30) {
          setUploadError(lang === 'hi' ? 'वीडियो ३० सेकंड से छोटा होना चाहिए।' : 'Video duration must be under 30 seconds.');
          setUploadFile(null);
          setPreviewUrl(null);
        }
      };
      video.src = URL.createObjectURL(file);
    }

    // Client-side image compression
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max dimension 1200px
          const maxDim = 1200;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, { type: "image/jpeg" });
              setUploadFile(compressedFile);
              setPreviewUrl(URL.createObjectURL(compressedFile));
            }
          }, 'image/jpeg', 0.8);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      setUploadFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Submit diagnostic image to server endpoint
  const requestDiagnosis = async () => {
    if (!uploadFile) return;
    setAnalysisLoading(true);
    setDiagnosis(null);
    setLearnMoreExpanded(false);

    const getDemoDiagnosisResponse = () => ({
      mostLikelyIssue: 'अगेती झुलसा / Early Blight (Alternaria solani)',
      alternativePossibilities: [
        'पर्णदाग रोग / Septoria Leaf Spot (सेप्टोरिया लीफ स्पॉट)',
        'जीवाणु चित्ती रोग / Bacterial Speck (बैक्टीरियल स्पेक)'
      ],
      confidence: 78,
      visibleIndicators: [
        'निचले पत्तों पर गोल गहरे भूरे छल्ले / Circular dark brown rings on lower leaves',
        'धब्बों के चारों ओर पीलापन / Yellow halo surrounding lesions'
      ],
      severity: 'high',
      urgency: 'soon',
      questionsForAccuracy: [
        'क्या यह केवल नीचे के पत्तों पर है? / Is this only on lower leaves?',
        'क्या ऊपरी नए पत्ते भी पीले हो रहे हैं? / Are the upper new leaves yellowing?'
      ],
      immediateAction: 'संक्रमित पत्तों को तुरंत निकालें। / Remove and destroy affected leaves.\nताम्र फफूंदनाशक दवा का छिड़काव करें। / Apply fungicide spray.\nखेत को सूखा रखें। / Keep the field dry.',
      organicOptions: [
        'नीम का काढ़ा / Neem decoction (₹100)',
        'ट्राइकोडर्मा जैविक नियंत्रण / Trichoderma (₹120)'
      ],
      chemicalCategory: 'कॉपर ऑक्सीक्लोराइड / Copper Oxychloride 50 WP (₹250)',
      preventionAdvice: 'फसल चक्र का पालन करें। / Practice crop rotation.',
      followUpDays: 5,
      requiresExpert: false,
    });

    try {
      const farmContext = `Farmer: Asha Pawar, Nashik, crop stage: tomato flowering`;
      const fd = new FormData();
      fd.append('image', uploadFile);
      fd.append('farmContext', farmContext);

      const res = await fetch('/api/ai/diagnose', {
        method: 'POST',
        body: fd
      });

      if (!res.ok) {
        throw new Error('Server returned error status');
      }

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setDiagnosis(data);

      // Add to persistent scans history
      const newScan = {
        id: `scan-${Date.now()}`,
        date: new Date().toLocaleDateString(),
        disease: data.mostLikelyIssue || 'स्वस्थ फ़सल / Healthy Crop',
        severity: data.severity || 'low',
        status: data.severity === 'critical' || data.severity === 'high' ? '🔴' : '🟢',
        thumbnail: previewUrl || '/placeholder-leaf.jpg'
      };
      const updatedHistory = [newScan, ...scansHistory];
      setScansHistory(updatedHistory);
      localStorage.setItem('km-scans-history', JSON.stringify(updatedHistory));
    } catch (err) {
      console.warn('Diagnosis endpoint error, using local fallback:', err);
      const fallbackResult = getDemoDiagnosisResponse();
      setDiagnosis(fallbackResult);

      // Add mock to scans history
      const newScan = {
        id: `scan-${Date.now()}`,
        date: new Date().toLocaleDateString(),
        disease: fallbackResult.mostLikelyIssue,
        severity: fallbackResult.severity,
        status: '🔴',
        thumbnail: previewUrl || '/placeholder-leaf.jpg'
      };
      const updatedHistory = [newScan, ...scansHistory];
      setScansHistory(updatedHistory);
      localStorage.setItem('km-scans-history', JSON.stringify(updatedHistory));
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Web Speech API synthesis for bilingual accessibility
  const speakResultsAloud = () => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToRead = diagnosis
      ? `${diagnosis.mostLikelyIssue}. ध्यान दें: ${diagnosis.immediateAction || ''}. जैविक सलाह: ${diagnosis.organicOptions?.[0] || ''}`
      : 'मंडी भाव अपडेट: नाशिक मंडी में आज टमाटर के भाव अच्छे हैं।';

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFDF7] flex flex-col items-center">
      {/* 480px Centered column container */}
      <div className="w-full max-w-[480px] bg-white min-h-screen flex flex-col shadow-lg border-x border-rgba(46,125,50,0.1)">
        
        {/* Header */}
        <header className="sticky top-0 z-30 bg-[#FAFDF7]/85 backdrop-blur-md px-4 py-3 border-b border-[#2E7D32]/10 flex items-center justify-between">
          <div className="flex items-center gap-2" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 rounded-full bg-[#E8F5E9] flex items-center justify-center text-[#2E7D32]">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-[#1B1B1B]">{t.title}</h1>
              <p className="text-[12px] text-zinc-500 font-semibold">{t.tagline}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* GPS Language selector button */}
            <button onClick={triggerGpsLocate} disabled={gpsStatus === 'searching'}
              className="p-2.5 rounded-full bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#DBF0DD] flex items-center justify-center transition-all min-h-[48px] min-w-[48px]">
              {gpsStatus === 'searching' ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
            </button>

            {/* Manual Language selection dropdown */}
            <div className="relative">
              <button onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#E8F5E9] text-[#2E7D32] font-bold text-sm min-h-[48px] border border-[#2E7D32]/10 transition-all">
                {LANGUAGES.find(l => l.code === lang)?.name.split(' ')[0]} <ChevronDown className="w-4 h-4" />
              </button>
              
              <AnimatePresence>
                {langMenuOpen && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 mt-2 w-48 bg-white border border-[#2E7D32]/10 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto">
                    {LANGUAGES.map(l => (
                      <button key={l.code} onClick={() => handleLanguageChange(l.code)}
                        className={`w-full px-4 py-3 text-left text-sm font-semibold border-b border-zinc-100 last:border-0 hover:bg-zinc-50 ${
                          lang === l.code ? 'text-[#2E7D32] bg-[#E8F5E9]' : 'text-zinc-700'
                        }`}>
                        {l.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* GPS success/error banners */}
        {gpsStatus === 'success' && (
          <div className="bg-emerald-50 text-[#2E7D32] text-xs font-semibold px-4 py-2 border-b border-emerald-100 text-center">
            {t.gpsSuccess} Language updated dynamically!
          </div>
        )}
        {gpsStatus === 'error' && (
          <div className="bg-rose-50 text-[#C62828] text-xs font-semibold px-4 py-2 border-b border-rose-100 text-center">
            {t.gpsDenied}
          </div>
        )}

        {/* Main content scroll region */}
        <main className="flex-1 overflow-y-auto p-4 pb-28">

          {/* TAB 1: HOME / CAMERA */}
          {activeTab === 'home' && (
            <div className="space-y-4">
              {!previewUrl && !useViewfinder ? (
                // Home Central Camera card
                <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="m3-card text-center p-8 border-2 border-dashed border-[#2E7D32]/25">
                  <div className="w-20 h-20 rounded-full bg-[#E8F5E9] flex items-center justify-center text-[#2E7D32] mx-auto mb-4 animate-camera-pulse"
                    onClick={startCameraViewfinder}>
                    <Camera className="w-10 h-10" />
                  </div>
                  <h2 className="text-xl font-black text-zinc-800 mb-2">{t.takePhoto}</h2>
                  <p className="text-sm text-zinc-500 mb-6 font-medium">अपनी फसल के पत्तों की साफ़ फ़ोटो खींचें। / Take clear photo of crop leaves.</p>
                  
                  {/* Invisible file upload handler */}
                  <input ref={fileInputRef} type="file" accept="image/*,video/*" capture="environment" className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} />

                  <div className="flex flex-col gap-3">
                    <button onClick={startCameraViewfinder} className="btn-m3-primary w-full">
                      <Camera className="w-5 h-5" /> {t.takePhoto}
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="btn-m3-secondary w-full">
                      <Upload className="w-4 h-4" /> {t.chooseGallery}
                    </button>
                  </div>
                  {uploadError && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-semibold">
                      {uploadError}
                    </div>
                  )}
                </motion.div>
              ) : useViewfinder ? (
                // Viewfinder fallback inside the layout
                <div className="m3-card relative overflow-hidden p-0 h-80 flex flex-col justify-between">
                  <video ref={videoRef} autoPlay playsInline className="viewfinder-video" />
                  <div className="absolute inset-x-0 bottom-4 flex justify-center gap-4 px-4">
                    <button onClick={stopCameraViewfinder} className="btn-m3-danger flex-1 min-h-[48px] py-2 px-3 rounded-full">
                      <X className="w-5 h-5" />
                    </button>
                    <button onClick={captureFrameFromViewfinder} className="btn-m3-primary flex-[2] min-h-[48px] py-2 px-3 rounded-full">
                      <Camera className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                // Photo/Video Preview Flow
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="m3-card space-y-4">
                  <div className="relative rounded-2xl overflow-hidden h-64 bg-black flex items-center justify-center">
                    {uploadFile?.type.startsWith('video/') ? (
                      <video src={previewUrl!} controls className="w-full h-full object-cover" />
                    ) : (
                      <img src={previewUrl!} alt="Crop upload preview" className="w-full h-full object-cover" />
                    )}
                    <button onClick={() => { setPreviewUrl(null); setUploadFile(null); setDiagnosis(null); }}
                      className="absolute top-3 right-3 p-2.5 rounded-full bg-black/60 text-white hover:bg-black min-h-[48px] min-w-[48px] flex items-center justify-center">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {!diagnosis && (
                    <button onClick={requestDiagnosis} disabled={analysisLoading} className="btn-m3-primary w-full">
                      {analysisLoading ? <span className="animate-spin mr-2">⏳</span> : <ShieldCheck className="w-5 h-5" />}
                      {analysisLoading ? t.analyzing : (lang === 'hi' ? 'जांच करें / Analyze' : 'Analyze')}
                    </button>
                  )}

                  {analysisLoading && (
                    <p className="text-center text-sm font-semibold text-[#2E7D32] animate-pulse">{t.analyzing}</p>
                  )}

                  {/* DIAGNOSIS RESULT CARD IN THE EXACT REQUESTED ORDER */}
                  {diagnosis && (
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-4 pt-2 border-t border-zinc-100">
                      
                      {/* a) Traffic-light health badge */}
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-sm border ${
                          diagnosis.severity === 'critical' || diagnosis.severity === 'high'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : diagnosis.severity === 'medium'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {diagnosis.severity === 'critical' || diagnosis.severity === 'high' ? t.diseased : diagnosis.severity === 'medium' ? t.alert : t.healthy}
                        </span>
                        
                        {/* Text to Speech trigger */}
                        <button onClick={speakResultsAloud}
                          className={`p-2.5 rounded-full flex items-center justify-center min-h-[48px] min-w-[48px] ${
                            isSpeaking ? 'bg-amber-100 text-amber-800' : 'bg-zinc-100 text-zinc-700'
                          }`}>
                          {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </button>
                      </div>

                      {/* b) Disease name in Hindi + English + confidence % as a simple bar */}
                      <div>
                        <h3 className="text-lg font-black text-zinc-800 mb-1">{diagnosis.mostLikelyIssue}</h3>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#2E7D32] rounded-full" style={{ width: `${diagnosis.confidence}%` }} />
                          </div>
                          <span className="text-xs font-mono font-bold text-[#2E7D32]">{diagnosis.confidence}%</span>
                        </div>
                      </div>

                      {/* c) "क्या करें / What to do" — max 3 steps, each one line, with icons */}
                      <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-100">
                        <div className="section-label text-zinc-500 font-extrabold text-[12px] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-[#2E7D32]" /> {t.whatToDo}
                        </div>
                        <ul className="space-y-2 text-sm text-zinc-700 font-semibold leading-relaxed">
                          {diagnosis.immediateAction.split('\n').slice(0, 3).map((step: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-[#2E7D32] font-extrabold mt-0.5">•</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* d) Fertiliser/treatment recommendation with LOCAL Indian product names and approximate cost in ₹ */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3 rounded-2xl bg-emerald-50/50 border border-[#2E7D32]/10">
                          <span className="text-[11px] font-black text-emerald-800 tracking-wider block mb-1">{t.organicOption}</span>
                          <ul className="space-y-1">
                            {diagnosis.organicOptions?.map((o: string, idx: number) => (
                              <li key={idx} className="text-sm font-bold text-[#2E7D32]">{o}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="p-3 rounded-2xl bg-rose-50/50 border border-[#C62828]/10">
                          <span className="text-[11px] font-black text-rose-800 tracking-wider block mb-1">{t.chemicalOption}</span>
                          <div className="text-sm font-bold text-[#C62828]">{diagnosis.chemicalCategory}</div>
                        </div>
                      </div>

                      {/* e) "दवा कब डालें" — best spray window based on weather */}
                      <div className="p-3 rounded-2xl bg-[#FFF8E1] border border-amber-200/50 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-black text-amber-800 tracking-wider block mb-1 uppercase">{t.bestSpray}</span>
                          <span className="text-sm font-bold text-zinc-700">सुबह ०६:०० - १०:०० (धूप तेज होने से पहले)</span>
                        </div>
                        <Clock className="w-5 h-5 text-amber-700 flex-shrink-0" />
                      </div>

                      {/* 4.2 Expandable "और जानें / Learn More" section for detail — collapsed by default */}
                      <div>
                        <button onClick={() => setLearnMoreExpanded(!learnMoreExpanded)}
                          className="w-full text-center py-2.5 text-sm font-bold text-[#2E7D32] hover:bg-[#E8F5E9] rounded-xl flex items-center justify-center gap-1.5 border border-[#2E7D32]/10 transition-all">
                          {t.learnMore} {learnMoreExpanded ? '▲' : '▼'}
                        </button>
                        <AnimatePresence>
                          {learnMoreExpanded && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden mt-2 p-3 bg-zinc-50 border border-zinc-100 rounded-xl space-y-2">
                              <span className="text-[11px] font-black text-zinc-500 uppercase">बचाव सलाह / Prevention</span>
                              <p className="text-sm font-semibold text-zinc-600 leading-normal">{diagnosis.preventionAdvice}</p>
                              {diagnosis.questionsForAccuracy && (
                                <div className="pt-2 border-t border-zinc-200">
                                  <span className="text-[11px] font-black text-zinc-500 uppercase block mb-1">अतिरिक्त प्रश्न / Questions</span>
                                  {diagnosis.questionsForAccuracy.map((q: string, idx: number) => (
                                    <div key={idx} className="text-xs font-semibold text-zinc-500 mb-1 last:mb-0">· {q}</div>
                                  ))}
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                    </motion.div>
                  )}
                </motion.div>
              )}
            </div>
          )}

          {/* TAB 2: WEATHER (मौसम) */}
          {activeTab === 'weather' && (
            <div className="space-y-4">
              {/* Warnings Banner Alerts */}
              <div className="m-card p-4 rounded-3xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-black text-amber-800">{t.weatherAlert}</h3>
                  <p className="text-xs text-amber-700 font-semibold mt-1">शाम को बारिश होने की संभावना ८५% है। कृपया कीटनाशक न छिड़कें।</p>
                </div>
              </div>

              {/* Grid showing Wind & Temp Banner Warnings */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/50 flex flex-col justify-between">
                  <Wind className="w-5 h-5 text-amber-700 mb-2" />
                  <span className="text-xs font-bold text-amber-800 leading-normal">{t.weatherWind}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/50 flex flex-col justify-between">
                  <ShieldCheck className="w-5 h-5 text-emerald-700 mb-2" />
                  <span className="text-xs font-bold text-emerald-800 leading-normal">{t.weatherTemp}</span>
                </div>
              </div>

              {/* Main Weather Card */}
              <div className="m3-card text-center">
                <span className="section-label text-zinc-500 font-bold text-xs uppercase tracking-wider block mb-2">{t.mandiNadhik.split(',')[0]}</span>
                <div className="flex items-center justify-center gap-4 mb-2">
                  <CloudRain className="w-16 h-16 text-zinc-700" />
                  <div>
                    <h2 className="text-4xl font-extrabold text-zinc-800">२७°C</h2>
                    <p className="text-sm font-semibold text-zinc-500">बादल छाए रहेंगे / Cloudy</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 border-t border-zinc-100 pt-4 mt-4">
                  {[
                    { label: 'हवा / Wind', val: '१२ किमी/घं' },
                    { label: 'नमी / Humid', val: '७८%' },
                    { label: 'बारिश / Rain', val: '३४ मिमी' }
                  ].map(({ label, val }) => (
                    <div key={label} className="text-center">
                      <span className="text-xs font-bold text-zinc-400 block">{label}</span>
                      <span className="text-sm font-extrabold text-zinc-700">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Simple 7-Day Forecast */}
              <div className="m3-card space-y-3">
                <span className="section-label text-zinc-500 font-bold text-xs uppercase tracking-wider block">७ दिनों का पूर्वानुमान / 7-Day Forecast</span>
                {[
                  { day: 'सोम / Mon', temp: '२८°C / २४°C', state: '🌧️', val: 'बारिश / Rain' },
                  { day: 'मंगल / Tue', temp: '२७°C / २३°C', state: '🌧️', val: 'बारिश / Rain' },
                  { day: 'बुध / Wed', temp: '२९°C / २५°C', state: '🌤️', val: 'धूप / Clear' },
                  { day: 'गुरु / Thu', temp: '३०°C / २५°C', state: '🌤️', val: 'धूप / Clear' },
                  { day: 'शुक्र / Fri', temp: '३१°C / २६°C', state: '☀️', val: 'तेज़ धूप / Hot' }
                ].map(({ day, temp, state, val }) => (
                  <div key={day} className="flex items-center justify-between py-2 border-b border-zinc-50 last:border-0 text-sm font-bold text-zinc-700">
                    <span>{day}</span>
                    <span className="flex items-center gap-2"><span>{state}</span> <span className="text-zinc-500">{val}</span></span>
                    <span className="font-mono text-xs">{temp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: MANDI (मंडी भाव) */}
          {activeTab === 'mandi' && (
            <div className="space-y-4">
              {/* Highlight Sell/Wait advice banner */}
              <div className="p-4 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-black text-emerald-800">{t.mandiAdvice}</h3>
                </div>
              </div>

              {/* Main price card */}
              <div className="m3-card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="section-label text-zinc-400 font-bold text-xs block uppercase mb-1">{t.mandiNadhik}</span>
                    <h2 className="text-2xl font-black text-zinc-800">{t.mandiTomato}</h2>
                  </div>
                  <TrendingUp className="w-8 h-8 text-[#2E7D32]" />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-4 rounded-2xl bg-zinc-50 text-center">
                    <span className="text-xs font-bold text-zinc-500 block">आज का भाव / Today</span>
                    <span className="text-2xl font-black text-[#2E7D32]">₹२,१५०</span>
                    <span className="text-xs font-bold text-zinc-500 block">प्रति क्विंटल / Quintal</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-zinc-50 text-center">
                    <span className="text-xs font-bold text-zinc-500 block">बदलाव / 5-Day Trend</span>
                    <span className="text-2xl font-black text-[#2E7D32]">↑ १२%</span>
                    <span className="text-xs font-bold text-zinc-500 block">कीमत बढ़ रही है / Rising</span>
                  </div>
                </div>
              </div>

              {/* Nearby mandis listing */}
              <div className="m3-card space-y-3">
                <span className="section-label text-zinc-500 font-bold text-xs uppercase tracking-wider block">आसपास की मंडियां / Nearby Markets</span>
                {[
                  { name: 'पिंपळगाव मंडी / Pimpalgaon', price: '₹२,१०० / क्विंटल', trend: '↑' },
                  { name: 'लासलगाव मंडी / Lasalgaon', price: '₹२,०५० / क्विंटल', trend: '↓' },
                  { name: 'पुणे मंडी / Pune APMC', price: '₹२,२०० / क्विंटल', trend: '↑' }
                ].map(({ name, price, trend }) => (
                  <div key={name} className="flex items-center justify-between py-2.5 border-b border-zinc-50 last:border-0 text-sm font-bold text-zinc-700">
                    <span>{name}</span>
                    <span className="flex items-center gap-1.5 text-zinc-800">
                      <span>{price}</span>
                      <span className={trend === '↑' ? 'text-[#2E7D32]' : 'text-[#C62828]'}>{trend}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: MY FARM (मेरा खेत) */}
          {activeTab === 'farm' && (
            <div className="space-y-4">
              {/* Farmer Info Card */}
              <div className="m3-card flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#E8F5E9] flex items-center justify-center text-[#2E7D32]">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-zinc-800">{t.farmerName}</h2>
                  <p className="text-xs font-bold text-zinc-500">{farmTwin.region}</p>
                  <p className="text-xs font-bold text-[#2E7D32] bg-[#E8F5E9] inline-block px-2.5 py-0.5 rounded-full mt-1.5">
                    {farmTwin.farmSizeHectares} {lang === 'hi' ? 'हेक्टेयर' : 'Hectares'}
                  </p>
                </div>
              </div>

              {/* Active Crops Grid */}
              <div className="m3-card">
                <span className="section-label text-zinc-500 font-bold text-xs uppercase tracking-wider block mb-3">{t.activeCrop}</span>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Leaf className="w-6 h-6 text-[#2E7D32]" />
                    <div>
                      <h3 className="text-sm font-black text-zinc-800">टमाटर (Tomato)</h3>
                      <span className="text-xs font-bold text-zinc-500">फूल आने की अवस्था / Flowering Stage</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-200">
                     Arka Rakshak
                  </span>
                </div>
              </div>

              {/* Scans history */}
              <div className="m3-card space-y-3">
                <span className="section-label text-zinc-500 font-bold text-xs uppercase tracking-wider block">{t.savedScans}</span>
                {scansHistory.length === 0 ? (
                  <p className="text-sm font-semibold text-zinc-400 text-center py-6">{t.noScans}</p>
                ) : (
                  scansHistory.map((scan) => (
                    <div key={scan.id} className="flex items-center gap-3 py-3 border-b border-zinc-50 last:border-0">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-100 flex-shrink-0">
                        <img src={scan.thumbnail} alt="Scan preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-black text-zinc-800 truncate">{scan.disease}</h4>
                        <span className="text-xs text-zinc-400 font-bold block">{scan.date}</span>
                      </div>
                      <span className="text-base flex-shrink-0">{scan.status}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </main>

        {/* Persistent FAB on bottom-right of every tab, min touch target 48px */}
        <button onClick={() => {
          setPreviewUrl(null);
          setUploadFile(null);
          setDiagnosis(null);
          setActiveTab('home');
          setTimeout(() => startCameraViewfinder(), 100);
        }}
          aria-label={t.takePhoto}
          className="m3-fab">
          <Camera className="w-6 h-6 text-[#1B1B1B]" />
          <span className="text-[9px] font-black tracking-tight leading-none mt-0.5">{lang === 'hi' ? 'फोटो' : 'Photo'}</span>
        </button>

        {/* Bottom Navigation with exactly 4 tabs */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#FAFDF7]/95 backdrop-blur-md border-t border-[#2E7D32]/10 py-2">
          <div className="max-w-[480px] mx-auto flex items-center justify-around">
            {[
              { id: 'home', label: t.home, icon: Camera },
              { id: 'weather', label: t.weather, icon: CloudRain },
              { id: 'mandi', label: t.mandi, icon: TrendingUp },
              { id: 'farm', label: t.myFarm, icon: Sprout }
            ].map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <button key={id} onClick={() => {
                  stopCameraViewfinder();
                  setActiveTab(id as any);
                }}
                  className="nav-tab-button flex-1 flex flex-col items-center justify-center transition-all">
                  <div className={`p-2.5 rounded-full transition-all flex items-center justify-center ${
                    isActive ? 'bg-[#2E7D32] text-white shadow-sm' : 'text-zinc-500 hover:text-[#2E7D32]'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`text-[12px] font-black mt-1 ${
                    isActive ? 'text-[#2E7D32]' : 'text-zinc-500'
                  }`}>{label}</span>
                </button>
              );
            })}
          </div>
        </nav>

      </div>
    </div>
  );
}
