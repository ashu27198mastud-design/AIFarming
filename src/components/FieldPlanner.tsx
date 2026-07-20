'use client';

import { useEffect, useMemo, useState } from 'react';
import { Camera, CheckCircle2, FileText, HelpCircle, Leaf, MapPin, Sparkles, Upload, XCircle } from 'lucide-react';
import type { LanguageCode } from '@/lib/i18n';

type Inputs = {
  soilType: 'unknown' | 'black' | 'red' | 'alluvial' | 'sandy' | 'clay';
  ph: string;
  water: 'low' | 'medium' | 'assured';
  irrigation: 'rain' | 'borewell' | 'canal' | 'drip';
  previousCrop: string;
  budget: 'low' | 'medium' | 'high';
};

type SoilAnalysis = {
  soilType: Inputs['soilType'];
  ph: number | null;
  nitrogen: string;
  phosphorus: string;
  potassium: string;
  organicCarbon: string;
  summary: string;
  warnings: string[];
  recommendations: string[];
  confidence: number;
};

type AiLandPlan = {
  landQualityScore: number;
  confidence: number;
  summary: string;
  take: Array<{ crop: string; score: number; why: string; fertilizerFocus: string }>;
  caution: Array<{ crop: string; score: number; why: string }>;
  avoid: Array<{ crop: string; score: number; why: string }>;
  preventiveActions: string[];
  missingEvidence: string[];
  disclaimer: string;
};

type Props = {
  coords: { lat: number; lng: number };
  market: { state: string; district: string; distanceKm: number };
  lang: LanguageCode;
  placeLabel: string;
};

type CropKey = 'soyabean' | 'cotton' | 'tomato' | 'onion' | 'wheat' | 'millet';
type ReasonKey = 'seasonFit' | 'soilFit' | 'waterFit' | 'phFit';
type RiskKey = 'soilUnknown' | 'seasonRisk' | 'soilRisk' | 'waterRisk' | 'budgetRisk' | 'phRisk' | 'repeatRisk';

const CROPS: Array<{ key: CropKey; name: string; season: 'kharif' | 'rabi' | 'both'; soils: Inputs['soilType'][]; water: Inputs['water']; budget: Inputs['budget'] }> = [
  { key: 'soyabean', name: 'Soyabean', season: 'kharif', soils: ['black', 'alluvial'], water: 'medium', budget: 'low' },
  { key: 'cotton', name: 'Cotton', season: 'kharif', soils: ['black', 'red'], water: 'medium', budget: 'medium' },
  { key: 'tomato', name: 'Tomato', season: 'both', soils: ['red', 'alluvial', 'sandy'], water: 'assured', budget: 'high' },
  { key: 'onion', name: 'Onion', season: 'rabi', soils: ['black', 'alluvial', 'sandy'], water: 'medium', budget: 'medium' },
  { key: 'wheat', name: 'Wheat', season: 'rabi', soils: ['alluvial', 'clay', 'black'], water: 'assured', budget: 'medium' },
  { key: 'millet', name: 'Millet', season: 'kharif', soils: ['sandy', 'red'], water: 'low', budget: 'low' },
];

const COPY = {
  en: {
    kicker: 'Field crop planner',
    title: 'What should I plant on this land?',
    subtitle: 'Add only what you know. Photo and soil report improve the answer, but they are optional.',
    step1: 'Soil',
    step1Text: 'Type, pH or report',
    step2: 'Water',
    step2Text: 'Availability and budget',
    step3: 'Decision',
    step3Text: 'Crop fit with risks',
    location: 'Planning area',
    evidence: 'Evidence strength',
    soilType: 'Soil type',
    soilPh: 'Soil pH (optional)',
    water: 'Water availability',
    irrigation: 'Irrigation source',
    budget: 'Budget',
    previousCrop: 'Previous crop',
    previousCropHint: 'Example: Cotton',
    phHint: 'Example: 6.8',
    landPhoto: 'Add land photo',
    changeLandPhoto: 'Change land photo',
    soilReport: 'Upload soil report',
    changeSoilReport: 'Change soil report',
    landFile: 'Land',
    soilFile: 'Soil report',
    soilIntel: 'Soil intelligence',
    readingReport: 'Reading laboratory report...',
    reportReady: 'Report understood',
    reportIssue: 'Report needs attention',
    confidence: 'confidence',
    notFound: 'Not found',
    next: 'Next',
    buildLoading: 'Studying land evidence...',
    buildPlan: 'Build crop plan',
    aiAnalysis: 'Smart land analysis',
    combining: 'Combining soil, GPS, season, water and land evidence...',
    planErrorSuffix: 'Transparent local scores are shown below.',
    verdict: 'Land verdict',
    landScore: 'land score',
    take: 'Take',
    avoidNow: 'Avoid now',
    caution: 'Caution',
    nutrition: 'Nutrition',
    preventFirst: 'Prevent first',
    cropDecision: 'Crop decision',
    evidenceConfidence: 'evidence confidence',
    risk: 'Risk',
    localAdvice: 'For a stronger decision, add soil pH, soil type, and a soil report. Confirm final crop and fertilizer dose with a local agriculture officer.',
    soil: { unknown: 'I do not know', black: 'Black soil', red: 'Red soil', alluvial: 'Alluvial / loam', sandy: 'Sandy', clay: 'Clay' },
    waterOpt: { low: 'Low / rain only', medium: 'Limited irrigation', assured: 'Assured water' },
    irrigationOpt: { rain: 'Rainfed', borewell: 'Borewell', canal: 'Canal', drip: 'Drip' },
    budgetOpt: { low: 'Low input', medium: 'Medium', high: 'Can invest more' },
    crop: { soyabean: 'Soyabean', cotton: 'Cotton', tomato: 'Tomato', onion: 'Onion', wheat: 'Wheat', millet: 'Millet' },
    reason: {
      seasonFit: 'Suitable for the current sowing season',
      soilFit: 'Good match for selected soil type',
      waterFit: 'Available water can support this crop',
      phFit: 'Entered soil pH is broadly suitable',
    },
    riskText: {
      soilUnknown: 'Soil type is not confirmed',
      seasonRisk: 'Not the preferred crop for the current sowing window',
      soilRisk: 'Soil compatibility is weak',
      waterRisk: 'Water availability may be insufficient',
      budgetRisk: 'Input cost may exceed selected budget',
      phRisk: 'Soil pH needs expert correction planning',
      repeatRisk: 'Repeating the same crop can increase pest and nutrient risk',
    },
  },
  hi: {
    kicker: 'खेत फसल योजना',
    title: 'इस जमीन पर कौन सी फसल लगाएं?',
    subtitle: 'जितनी जानकारी है उतनी भरें। फोटो और मिट्टी रिपोर्ट से सलाह बेहतर होगी, पर जरूरी नहीं है।',
    step1: 'मिट्टी',
    step1Text: 'प्रकार, pH या रिपोर्ट',
    step2: 'पानी',
    step2Text: 'उपलब्धता और खर्च',
    step3: 'निर्णय',
    step3Text: 'फसल मिलान और जोखिम',
    location: 'योजना क्षेत्र',
    evidence: 'जानकारी की मजबूती',
    soilType: 'मिट्टी का प्रकार',
    soilPh: 'मिट्टी pH (वैकल्पिक)',
    water: 'पानी की उपलब्धता',
    irrigation: 'सिंचाई स्रोत',
    budget: 'बजट',
    previousCrop: 'पिछली फसल',
    previousCropHint: 'उदाहरण: कपास',
    phHint: 'उदाहरण: 6.8',
    landPhoto: 'जमीन की फोटो जोड़ें',
    changeLandPhoto: 'जमीन की फोटो बदलें',
    soilReport: 'मिट्टी रिपोर्ट अपलोड करें',
    changeSoilReport: 'मिट्टी रिपोर्ट बदलें',
    landFile: 'जमीन',
    soilFile: 'मिट्टी रिपोर्ट',
    soilIntel: 'मिट्टी समझ',
    readingReport: 'लैब रिपोर्ट पढ़ रहे हैं...',
    reportReady: 'रिपोर्ट समझ ली गई',
    reportIssue: 'रिपोर्ट में ध्यान चाहिए',
    confidence: 'भरोसा',
    notFound: 'नहीं मिला',
    next: 'अगला',
    buildLoading: 'जमीन की जानकारी देख रहे हैं...',
    buildPlan: 'फसल योजना बनाएं',
    aiAnalysis: 'स्मार्ट जमीन विश्लेषण',
    combining: 'मिट्टी, GPS, मौसम, पानी और जमीन की जानकारी जोड़ रहे हैं...',
    planErrorSuffix: 'नीचे पारदर्शी स्थानीय स्कोर दिखाए गए हैं।',
    verdict: 'जमीन निर्णय',
    landScore: 'जमीन स्कोर',
    take: 'ले सकते हैं',
    avoidNow: 'अभी न लें',
    caution: 'सावधानी',
    nutrition: 'पोषण',
    preventFirst: 'पहले रोकथाम',
    cropDecision: 'फसल निर्णय',
    evidenceConfidence: 'जानकारी भरोसा',
    risk: 'जोखिम',
    localAdvice: 'बेहतर निर्णय के लिए मिट्टी pH, मिट्टी प्रकार और मिट्टी रिपोर्ट जोड़ें। अंतिम फसल और खाद मात्रा स्थानीय कृषि अधिकारी से पक्का करें।',
    soil: { unknown: 'मुझे नहीं पता', black: 'काली मिट्टी', red: 'लाल मिट्टी', alluvial: 'दोमट / जलोढ़', sandy: 'रेतीली', clay: 'चिकनी मिट्टी' },
    waterOpt: { low: 'कम / केवल बारिश', medium: 'सीमित सिंचाई', assured: 'पक्का पानी', },
    irrigationOpt: { rain: 'बारिश आधारित', borewell: 'बोरवेल', canal: 'नहर', drip: 'ड्रिप' },
    budgetOpt: { low: 'कम खर्च', medium: 'मध्यम', high: 'ज्यादा निवेश कर सकते हैं' },
    crop: { soyabean: 'सोयाबीन', cotton: 'कपास', tomato: 'टमाटर', onion: 'प्याज', wheat: 'गेहूं', millet: 'बाजरा' },
    reason: {
      seasonFit: 'मौजूदा बुवाई मौसम के लिए ठीक है',
      soilFit: 'चुनी हुई मिट्टी से अच्छा मेल है',
      waterFit: 'उपलब्ध पानी इस फसल को संभाल सकता है',
      phFit: 'दिया गया pH सामान्य रूप से ठीक है',
    },
    riskText: {
      soilUnknown: 'मिट्टी का प्रकार पक्का नहीं है',
      seasonRisk: 'इस समय की बुवाई के लिए यह पहली पसंद नहीं है',
      soilRisk: 'मिट्टी का मेल कमजोर है',
      waterRisk: 'पानी कम पड़ सकता है',
      budgetRisk: 'इनपुट खर्च चुने बजट से ऊपर जा सकता है',
      phRisk: 'pH सुधार के लिए विशेषज्ञ सलाह चाहिए',
      repeatRisk: 'वही फसल दोहराने से कीट और पोषण जोखिम बढ़ सकता है',
    },
  },
  mr: {
    kicker: 'शेत पीक योजना',
    title: 'या जमिनीवर कोणते पीक घ्यावे?',
    subtitle: 'जेवढी माहिती आहे तेवढी भरा. फोटो आणि माती अहवालाने सल्ला अधिक अचूक होईल, पण ते आवश्यक नाही.',
    step1: 'माती',
    step1Text: 'प्रकार, pH किंवा अहवाल',
    step2: 'पाणी',
    step2Text: 'उपलब्धता आणि खर्च',
    step3: 'निर्णय',
    step3Text: 'पीक जुळवणी आणि धोका',
    location: 'योजना क्षेत्र',
    evidence: 'माहितीची ताकद',
    soilType: 'मातीचा प्रकार',
    soilPh: 'माती pH (ऐच्छिक)',
    water: 'पाण्याची उपलब्धता',
    irrigation: 'सिंचन स्रोत',
    budget: 'बजेट',
    previousCrop: 'मागील पीक',
    previousCropHint: 'उदा: कापूस',
    phHint: 'उदा: 6.8',
    landPhoto: 'जमिनीचा फोटो जोडा',
    changeLandPhoto: 'जमिनीचा फोटो बदला',
    soilReport: 'माती अहवाल अपलोड करा',
    changeSoilReport: 'माती अहवाल बदला',
    landFile: 'जमीन',
    soilFile: 'माती अहवाल',
    soilIntel: 'माती समज',
    readingReport: 'लॅब अहवाल वाचत आहे...',
    reportReady: 'अहवाल समजला',
    reportIssue: 'अहवालाकडे लक्ष हवे',
    confidence: 'विश्वास',
    notFound: 'आढळले नाही',
    next: 'पुढचे',
    buildLoading: 'जमिनीची माहिती तपासत आहे...',
    buildPlan: 'पीक योजना तयार करा',
    aiAnalysis: 'स्मार्ट जमीन विश्लेषण',
    combining: 'माती, GPS, हंगाम, पाणी आणि जमिनीची माहिती जोडत आहे...',
    planErrorSuffix: 'खाली पारदर्शक स्थानिक स्कोर दाखवले आहेत.',
    verdict: 'जमीन निर्णय',
    landScore: 'जमीन स्कोर',
    take: 'घेऊ शकता',
    avoidNow: 'आता टाळा',
    caution: 'काळजी',
    nutrition: 'पोषण',
    preventFirst: 'आधी प्रतिबंध',
    cropDecision: 'पीक निर्णय',
    evidenceConfidence: 'माहिती विश्वास',
    risk: 'धोका',
    localAdvice: 'अधिक मजबूत निर्णयासाठी माती pH, मातीचा प्रकार आणि माती अहवाल जोडा. अंतिम पीक आणि खत मात्रा स्थानिक कृषी अधिकाऱ्यांकडून खात्री करा.',
    soil: { unknown: 'माहित नाही', black: 'काळी माती', red: 'लाल माती', alluvial: 'गाळ / दोमट', sandy: 'वालुकामय', clay: 'चिकण माती' },
    waterOpt: { low: 'कमी / फक्त पाऊस', medium: 'मर्यादित सिंचन', assured: 'हमीचे पाणी' },
    irrigationOpt: { rain: 'पावसावर', borewell: 'बोअरवेल', canal: 'कालवा', drip: 'ड्रिप' },
    budgetOpt: { low: 'कमी खर्च', medium: 'मध्यम', high: 'जास्त गुंतवणूक शक्य' },
    crop: { soyabean: 'सोयाबीन', cotton: 'कापूस', tomato: 'टोमॅटो', onion: 'कांदा', wheat: 'गहू', millet: 'बाजरी' },
    reason: {
      seasonFit: 'सध्याच्या पेरणी हंगामासाठी योग्य',
      soilFit: 'निवडलेल्या मातीशी चांगला मेळ',
      waterFit: 'उपलब्ध पाणी हे पीक सांभाळू शकते',
      phFit: 'दिलेला pH साधारण योग्य आहे',
    },
    riskText: {
      soilUnknown: 'मातीचा प्रकार निश्चित नाही',
      seasonRisk: 'या पेरणी वेळेसाठी हे पहिल्या पसंतीचे पीक नाही',
      soilRisk: 'मातीशी मेळ कमजोर आहे',
      waterRisk: 'पाणी अपुरे पडू शकते',
      budgetRisk: 'इनपुट खर्च निवडलेल्या बजेटपेक्षा जास्त जाऊ शकतो',
      phRisk: 'pH सुधारासाठी तज्ज्ञ सल्ला हवा',
      repeatRisk: 'तेच पीक पुन्हा घेतल्यास कीड आणि पोषण धोका वाढू शकतो',
    },
  },
} as const;

function currentSeason(): 'kharif' | 'rabi' | 'summer' {
  const month = new Date().getMonth() + 1;
  if (month >= 6 && month <= 10) return 'kharif';
  if (month >= 11 || month <= 3) return 'rabi';
  return 'summer';
}

function scoreCrop(crop: typeof CROPS[number], input: Inputs) {
  const season = currentSeason();
  let score = 44;
  const reasons: ReasonKey[] = [];
  const risks: RiskKey[] = [];

  if (crop.season === season || crop.season === 'both') {
    score += 22;
    reasons.push('seasonFit');
  } else {
    score -= 24;
    risks.push('seasonRisk');
  }

  if (input.soilType === 'unknown') {
    risks.push('soilUnknown');
  } else if (crop.soils.includes(input.soilType)) {
    score += 16;
    reasons.push('soilFit');
  } else {
    score -= 12;
    risks.push('soilRisk');
  }

  const waterRank = { low: 1, medium: 2, assured: 3 };
  if (waterRank[input.water] >= waterRank[crop.water]) {
    score += 12;
    reasons.push('waterFit');
  } else {
    score -= 22;
    risks.push('waterRisk');
  }

  const budgetRank = { low: 1, medium: 2, high: 3 };
  if (budgetRank[input.budget] >= budgetRank[crop.budget]) score += 6;
  else {
    score -= 10;
    risks.push('budgetRisk');
  }

  const ph = Number(input.ph);
  if (Number.isFinite(ph) && ph > 0) {
    if (ph >= 6 && ph <= 7.8) {
      score += 8;
      reasons.push('phFit');
    } else {
      score -= 10;
      risks.push('phRisk');
    }
  }

  if (input.previousCrop.toLowerCase() === crop.name.toLowerCase()) {
    score -= 8;
    risks.push('repeatRisk');
  }

  const finalScore = Math.max(12, Math.min(96, score));
  return {
    ...crop,
    score: finalScore,
    status: finalScore >= 72 ? 'take' : finalScore >= 52 ? 'caution' : 'avoid',
    reasons: reasons.slice(0, 3),
    risks: risks.slice(0, 3),
  };
}

function cropLabel(raw: string, lang: LanguageCode): string {
  const normalized = raw.toLowerCase();
  const match = CROPS.find((crop) => normalized.includes(crop.name.toLowerCase()) || normalized.includes(crop.key));
  return match ? COPY[lang].crop[match.key] : raw;
}

export default function FieldPlanner({ coords, market, lang, placeLabel }: Props) {
  const copy = COPY[lang];
  const [inputs, setInputs] = useState<Inputs>({
    soilType: 'unknown',
    ph: '',
    water: 'medium',
    irrigation: 'rain',
    previousCrop: '',
    budget: 'medium',
  });
  const [landPhoto, setLandPhoto] = useState<File | null>(null);
  const [soilReport, setSoilReport] = useState<File | null>(null);
  const [soilAnalysis, setSoilAnalysis] = useState<SoilAnalysis | null>(null);
  const [soilLoading, setSoilLoading] = useState(false);
  const [soilError, setSoilError] = useState('');
  const [aiPlan, setAiPlan] = useState<AiLandPlan | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState('');
  const [showResults, setShowResults] = useState(false);
  const photoUrl = useMemo(() => landPhoto ? URL.createObjectURL(landPhoto) : '', [landPhoto]);
  const ranked = useMemo(() => CROPS.map((crop) => scoreCrop(crop, inputs)).sort((a, b) => b.score - a.score), [inputs]);
  const confidence = Math.min(94, 48 + (inputs.soilType !== 'unknown' ? 12 : 0) + (inputs.ph ? 10 : 0) + (landPhoto ? 10 : 0) + (soilReport ? 14 : 0));

  useEffect(() => () => {
    if (photoUrl) URL.revokeObjectURL(photoUrl);
  }, [photoUrl]);

  const analyzeSoilReport = async (file: File) => {
    setSoilReport(file);
    setSoilLoading(true);
    setSoilError('');
    setSoilAnalysis(null);
    try {
      const body = new FormData();
      body.append('report', file);
      const response = await fetch('/api/ai/soil-report', { method: 'POST', body });
      const payload = await response.json();
      if (!response.ok || payload.error) throw new Error(payload.error || copy.reportIssue);
      const analysis = payload as SoilAnalysis;
      setSoilAnalysis(analysis);
      setInputs((current) => ({
        ...current,
        soilType: analysis.soilType !== 'unknown' ? analysis.soilType : current.soilType,
        ph: analysis.ph !== null ? String(analysis.ph) : current.ph,
      }));
    } catch (error) {
      setSoilError(error instanceof Error ? error.message : copy.reportIssue);
    } finally {
      setSoilLoading(false);
    }
  };

  const buildAiPlan = async () => {
    setShowResults(true);
    setPlanLoading(true);
    setPlanError('');
    setAiPlan(null);
    try {
      const context = {
        language: lang,
        gps: { ...coords, nearestMandiDistrict: market.district, state: market.state, distanceKm: market.distanceKm },
        season: currentSeason(),
        soilType: inputs.soilType,
        ph: inputs.ph || null,
        waterAvailability: inputs.water,
        irrigation: inputs.irrigation,
        budget: inputs.budget,
        previousCrop: inputs.previousCrop || 'not provided',
        soilReport: soilAnalysis,
        evidence: { hasLandPhoto: Boolean(landPhoto), hasSoilReport: Boolean(soilReport) },
      };
      const body = new FormData();
      body.append('context', JSON.stringify(context));
      if (landPhoto) body.append('landPhoto', landPhoto);
      const response = await fetch('/api/ai/land-plan', { method: 'POST', body });
      const payload = await response.json();
      if (!response.ok || payload.error) throw new Error(payload.error || copy.planErrorSuffix);
      setAiPlan(payload as AiLandPlan);
    } catch (error) {
      setPlanError(error instanceof Error ? error.message : copy.planErrorSuffix);
    } finally {
      setPlanLoading(false);
    }
  };

  return (
    <section className="field-planner planner-workspace">
      <div className="planner-hero premium-glass-card premium-glass-card-raised">
        <div>
          <span className="section-kicker"><Leaf className="h-3.5 w-3.5 text-[#65776E]" /> {copy.kicker}</span>
          <h2>{copy.title}</h2>
          <p>{copy.subtitle}</p>
        </div>
        <div className="planner-context-card">
          <MapPin className="h-5 w-5" />
          <span><small>{copy.location}</small><strong>{placeLabel}</strong></span>
        </div>
      </div>

      <div className="planner-steps" aria-label={copy.kicker}>
        <div><strong>01</strong><span>{copy.step1}</span><small>{copy.step1Text}</small></div>
        <div><strong>02</strong><span>{copy.step2}</span><small>{copy.step2Text}</small></div>
        <div><strong>03</strong><span>{copy.step3}</span><small>{copy.step3Text}</small></div>
      </div>

      <div className="planner-grid">
        <section className="planner-card premium-glass-card planner-input-card">
          <div className="planner-card-heading">
            <span><Sparkles className="h-4 w-4" /> {copy.evidence}</span>
            <strong>{confidence}%</strong>
          </div>

          <div className="planner-form-grid">
            <label>
              {copy.soilType}
              <select value={inputs.soilType} onChange={(event) => setInputs({ ...inputs, soilType: event.target.value as Inputs['soilType'] })}>
                {Object.entries(copy.soil).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label>
              {copy.soilPh}
              <input inputMode="decimal" value={inputs.ph} onChange={(event) => setInputs({ ...inputs, ph: event.target.value })} placeholder={copy.phHint} />
            </label>
            <label>
              {copy.water}
              <select value={inputs.water} onChange={(event) => setInputs({ ...inputs, water: event.target.value as Inputs['water'] })}>
                {Object.entries(copy.waterOpt).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label>
              {copy.irrigation}
              <select value={inputs.irrigation} onChange={(event) => setInputs({ ...inputs, irrigation: event.target.value as Inputs['irrigation'] })}>
                {Object.entries(copy.irrigationOpt).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label>
              {copy.budget}
              <select value={inputs.budget} onChange={(event) => setInputs({ ...inputs, budget: event.target.value as Inputs['budget'] })}>
                {Object.entries(copy.budgetOpt).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label>
              {copy.previousCrop}
              <input value={inputs.previousCrop} onChange={(event) => setInputs({ ...inputs, previousCrop: event.target.value })} placeholder={copy.previousCropHint} />
            </label>
          </div>
        </section>

        <aside className="planner-card premium-glass-card planner-evidence-card">
          <label className="planner-upload-tile">
            <Camera className="h-5 w-5" />
            <span>{landPhoto ? copy.changeLandPhoto : copy.landPhoto}</span>
            <input type="file" accept="image/*" capture="environment" onChange={(event) => setLandPhoto(event.target.files?.[0] ?? null)} />
          </label>
          <label className="planner-upload-tile planner-upload-warm">
            <Upload className="h-5 w-5" />
            <span>{soilReport ? copy.changeSoilReport : copy.soilReport}</span>
            <input
              data-testid="upload-soil-report"
              type="file"
              accept="image/*,.pdf,application/pdf"
              onChange={(event) => {
                const file = event.currentTarget.files?.[0];
                if (file) void analyzeSoilReport(file);
                event.currentTarget.value = '';
              }}
            />
          </label>
          {(photoUrl || soilReport) && (
            <div className="planner-file-preview">
              {photoUrl ? <img src={photoUrl} alt={copy.landPhoto} /> : <FileText className="h-8 w-8 text-[#8A7655]" />}
              <div>
                {landPhoto && <p>{copy.landFile}: {landPhoto.name}</p>}
                {soilReport && <p>{copy.soilFile}: {soilReport.name}</p>}
              </div>
            </div>
          )}
        </aside>
      </div>

      {(soilLoading || soilAnalysis || soilError) && (
        <div className="soil-analysis-panel planner-soil-panel">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="section-kicker"><FileText className="h-3.5 w-3.5" /> {copy.soilIntel}</span>
              <h3 className="mt-2 text-lg font-black text-[#202723]">{soilLoading ? copy.readingReport : soilAnalysis ? copy.reportReady : copy.reportIssue}</h3>
            </div>
            {soilAnalysis && <span className="metric-pill">{soilAnalysis.confidence}% {copy.confidence}</span>}
          </div>
          {soilLoading && <div className="soil-loading-bar"><span /></div>}
          {soilError && <p className="mt-3 text-sm font-bold text-rose-700">{soilError}</p>}
          {soilAnalysis && (
            <>
              <p className="mt-3 text-sm font-semibold leading-relaxed text-zinc-700">{soilAnalysis.summary}</p>
              <div className="soil-metrics">
                <div><span>pH</span><strong>{soilAnalysis.ph ?? copy.notFound}</strong></div>
                <div><span>N</span><strong>{soilAnalysis.nitrogen}</strong></div>
                <div><span>P</span><strong>{soilAnalysis.phosphorus}</strong></div>
                <div><span>K</span><strong>{soilAnalysis.potassium}</strong></div>
              </div>
              {soilAnalysis.recommendations[0] && <p className="mt-3 rounded-xl bg-white/70 p-3 text-xs font-bold text-[#46554D]">{copy.next}: {soilAnalysis.recommendations[0]}</p>}
            </>
          )}
        </div>
      )}

      <button type="button" onClick={() => void buildAiPlan()} disabled={planLoading} className="planner-primary-action">
        <Leaf className="h-5 w-5" /> {planLoading ? copy.buildLoading : copy.buildPlan}
      </button>

      {showResults && (
        <div className="planner-results">
          {planLoading && <div className="soil-analysis-panel"><span className="section-kicker">{copy.aiAnalysis}</span><h3 className="mt-2 text-lg font-black">{copy.combining}</h3><div className="soil-loading-bar"><span /></div></div>}
          {planError && <p className="rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-700">{planError} {copy.planErrorSuffix}</p>}
          {aiPlan && (
            <section className="ai-land-plan">
              <div className="ai-land-plan-head">
                <div><span className="section-kicker">{copy.verdict}</span><h3>{aiPlan.summary}</h3></div>
                <div className="land-score"><strong>{aiPlan.landQualityScore}</strong><span>{copy.landScore}</span></div>
              </div>
              <div className="ai-crop-grid">
                {aiPlan.take.map((crop) => <div key={crop.crop} className="ai-crop-take"><span>{copy.take}</span><strong>{cropLabel(crop.crop, lang)} · {crop.score}/100</strong><p>{crop.why}</p><small>{copy.nutrition}: {crop.fertilizerFocus}</small></div>)}
                {aiPlan.avoid.map((crop) => <div key={crop.crop} className="ai-crop-avoid"><span>{copy.avoidNow}</span><strong>{cropLabel(crop.crop, lang)} · {crop.score}/100</strong><p>{crop.why}</p></div>)}
              </div>
              {aiPlan.preventiveActions[0] && <p className="mt-3 text-sm font-bold text-[#43534b]">{copy.preventFirst}: {aiPlan.preventiveActions[0]}</p>}
              <p className="mt-2 text-[11px] font-bold text-zinc-500">{aiPlan.confidence}% {copy.confidence}. {aiPlan.disclaimer}</p>
            </section>
          )}
          <div className="planner-local-head">
            <h3>{copy.cropDecision}</h3>
            <span className="metric-pill">{confidence}% {copy.evidenceConfidence}</span>
          </div>
          <div className="planner-crop-list">
            {ranked.slice(0, 4).map((crop) => (
              <div key={crop.name} className={`planner-crop-card planner-crop-${crop.status}`}>
                <div>
                  {crop.status === 'avoid' ? <XCircle className="h-5 w-5" /> : crop.status === 'take' ? <CheckCircle2 className="h-5 w-5" /> : <HelpCircle className="h-5 w-5" />}
                  <strong>{copy.crop[crop.key]}</strong>
                </div>
                <span>{crop.status === 'take' ? copy.take : crop.status === 'avoid' ? copy.avoidNow : copy.caution} · {crop.score}/100</span>
                <p>{crop.reasons[0] ? copy.reason[crop.reasons[0]] : copy.riskText[crop.risks[0]]}</p>
                {crop.risks[0] && <small>{copy.risk}: {copy.riskText[crop.risks[0]]}</small>}
              </div>
            ))}
          </div>
          {confidence < 70 && <p className="planner-advice-note">{copy.localAdvice}</p>}
        </div>
      )}
    </section>
  );
}
