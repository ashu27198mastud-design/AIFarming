import type { DailyWeather, WeatherForecast } from '@/types';
import type { ScanHistoryItem } from '@/components/tabs/HomeTab';
import type { LanguageCode } from '@/lib/i18n';

export type CropRecommendation = {
  crop: string;
  localName: string;
  score: number;
  season: string;
  waterNeed: 'low' | 'medium' | 'high';
  profitSignal: 'rising' | 'stable' | 'watch';
  reasons: string[];
  fertilizerFocus: string[];
};

export type PreventiveAlert = {
  title: string;
  detail: string;
  tone: 'good' | 'watch' | 'danger';
};

export type FertilizerPlan = {
  crop: string;
  stage: string;
  priority: string;
  organic: string;
  mineralCategory: string;
  timing: string;
  safety: string;
};

export type EducationCard = {
  title: string;
  lesson: string;
  action: string;
};

export type FarmIntelligence = {
  readinessScore: number;
  todayAction: string;
  actionReason: string;
  diseaseRisk: 'low' | 'medium' | 'high';
  cropRecommendations: CropRecommendation[];
  preventiveAlerts: PreventiveAlert[];
  fertilizerPlan: FertilizerPlan;
  educationCards: EducationCard[];
};

type BuildInput = {
  coords: { lat: number; lng: number };
  forecast: WeatherForecast | null;
  scans: ScanHistoryItem[];
  farm: {
    region: string;
    farmSizeHectares: number;
  };
  lang?: LanguageCode;
};

const CROP_CATALOG = [
  {
    crop: 'Tomato',
    localName: 'टमाटर / Tomato',
    season: 'Kharif + protected Rabi',
    waterNeed: 'medium' as const,
    marketBase: 24,
    diseaseSensitivity: 14,
    fertilizerFocus: ['Calcium support', 'Potassium at flowering', 'Balanced nitrogen'],
  },
  {
    crop: 'Onion',
    localName: 'प्याज़ / Onion',
    season: 'Rabi',
    waterNeed: 'low' as const,
    marketBase: 22,
    diseaseSensitivity: 8,
    fertilizerFocus: ['Sulphur', 'Phosphorus at root stage', 'Split nitrogen'],
  },
  {
    crop: 'Soyabean',
    localName: 'सोयाबीन / Soyabean',
    season: 'Kharif',
    waterNeed: 'medium' as const,
    marketBase: 18,
    diseaseSensitivity: 10,
    fertilizerFocus: ['Rhizobium seed treatment', 'Phosphorus', 'Micronutrients'],
  },
  {
    crop: 'Wheat',
    localName: 'गेहूं / Wheat',
    season: 'Rabi',
    waterNeed: 'medium' as const,
    marketBase: 14,
    diseaseSensitivity: 6,
    fertilizerFocus: ['Nitrogen splits', 'Zinc if deficient', 'Potash in light soil'],
  },
  {
    crop: 'Cotton',
    localName: 'कपास / Cotton',
    season: 'Kharif',
    waterNeed: 'high' as const,
    marketBase: 20,
    diseaseSensitivity: 12,
    fertilizerFocus: ['Potassium', 'Boron at square formation', 'Avoid excess nitrogen'],
  },
];

type LocalizedText = Record<LanguageCode, string>;

const CROP_NAMES: Record<string, LocalizedText> = {
  Tomato: { en: 'Tomato', hi: 'टमाटर', mr: 'टोमॅटो' },
  Onion: { en: 'Onion', hi: 'प्याज', mr: 'कांदा' },
  Soyabean: { en: 'Soyabean', hi: 'सोयाबीन', mr: 'सोयाबीन' },
  Wheat: { en: 'Wheat', hi: 'गेहूं', mr: 'गहू' },
  Cotton: { en: 'Cotton', hi: 'कपास', mr: 'कापूस' },
};

const FERTILIZER_FOCUS: Record<string, Record<LanguageCode, string[]>> = {
  Tomato: {
    en: ['Calcium support', 'Potassium at flowering', 'Balanced nitrogen'],
    hi: ['कैल्शियम सहयोग', 'फूल अवस्था में पोटाश', 'संतुलित नाइट्रोजन'],
    mr: ['कॅल्शियम आधार', 'फुलोऱ्यात पोटॅश', 'संतुलित नायट्रोजन'],
  },
  Onion: {
    en: ['Sulphur', 'Phosphorus at root stage', 'Split nitrogen'],
    hi: ['सल्फर', 'जड़ अवस्था में फॉस्फोरस', 'नाइट्रोजन को हिस्सों में दें'],
    mr: ['सल्फर', 'मुळांच्या अवस्थेत फॉस्फरस', 'नायट्रोजन विभागून द्या'],
  },
  Soyabean: {
    en: ['Rhizobium seed treatment', 'Phosphorus', 'Micronutrients'],
    hi: ['राइजोबियम बीज उपचार', 'फॉस्फोरस', 'सूक्ष्म पोषक तत्व'],
    mr: ['रायझोबियम बियाणे प्रक्रिया', 'फॉस्फरस', 'सूक्ष्म अन्नद्रव्ये'],
  },
  Wheat: {
    en: ['Nitrogen splits', 'Zinc if deficient', 'Potash in light soil'],
    hi: ['नाइट्रोजन को हिस्सों में दें', 'कमी हो तो जिंक', 'हल्की मिट्टी में पोटाश'],
    mr: ['नायट्रोजन विभागून द्या', 'कमतरता असल्यास झिंक', 'हलकी माती असल्यास पोटॅश'],
  },
  Cotton: {
    en: ['Potassium', 'Boron at square formation', 'Avoid excess nitrogen'],
    hi: ['पोटाश', 'स्क्वेयर बनने पर बोरॉन', 'अधिक नाइट्रोजन से बचें'],
    mr: ['पोटॅश', 'पाते/कळी अवस्थेत बोरॉन', 'जास्त नायट्रोजन टाळा'],
  },
};

const FARM_COPY = {
  en: {
    planCrop: (crop: string, score: number) => 'Plan ' + crop + ' with a ' + score + '/100 crop-profit score.',
    planReason: 'Best recommendation combines season, water need, weather risk, and market potential.',
    noSpray: 'Do not spray today. Wait for the safe weather window.',
    noSprayReason: (rain: number, wind: number) => 'Rain risk ' + rain + '% and wind up to ' + wind + ' km/h can reduce spray effectiveness.',
    inspectLeaves: 'Inspect leaves today and prepare preventive disease control.',
    inspectReason: 'Humidity and rain pattern can trigger fungal pressure before visible loss appears.',
    floweringStage: 'Flowering and fruit-set planning',
    earlyStage: 'Pre-sowing and early growth planning',
    organic: 'Use compost or well-decomposed farmyard manure before major nutrient correction.',
    onionMineral: 'Sulphur + balanced NPK category',
    defaultMineral: 'Balanced NPK + crop-specific micronutrient category',
    fertilizerTiming: 'Apply only after soil moisture check; avoid fertilizer before heavy rain.',
    fertilizerSafety: 'No dosage is shown without soil test. Follow local agriculture officer or product label.',
    fungalTitle: 'Fungal pressure building',
    fungalDetail: 'Humidity and rain probability are high. Inspect lower leaves and avoid unnecessary irrigation.',
    sprayTitle: 'Spray timing blocked',
    sprayDetail: 'Wind or rain can waste spray and reduce protection. Wait for a dry low-wind window.',
    heatTitle: 'Heat stress watch',
    heatDetail: 'Shift irrigation to early morning or evening and protect young plants from midday stress.',
    scanTitle: 'Follow-up scan needed',
    scanDetail: (severity: string) => 'Latest scan shows ' + severity + ' severity. Capture another photo after 2-3 days.',
    clearTitle: 'No major immediate risk',
    clearDetail: 'Weather and scan history do not show a strong warning signal today.',
  },
  hi: {
    planCrop: (crop: string, score: number) => crop + ' की योजना बनाएं। फसल लाभ स्कोर ' + score + '/100 है।',
    planReason: 'सलाह मौसम, पानी की जरूरत, रोग जोखिम और मंडी संभावना को मिलाकर बनाई गई है।',
    noSpray: 'आज छिड़काव न करें। सुरक्षित मौसम खिड़की का इंतजार करें।',
    noSprayReason: (rain: number, wind: number) => 'बारिश जोखिम ' + rain + '% और हवा ' + wind + ' km/h तक है, इससे छिड़काव का असर घट सकता है।',
    inspectLeaves: 'आज पत्तियों की जांच करें और रोग से बचाव की तैयारी रखें।',
    inspectReason: 'नमी और बारिश का पैटर्न दिखने वाले नुकसान से पहले फफूंद दबाव बढ़ा सकता है।',
    floweringStage: 'फूल और फल बनने की योजना',
    earlyStage: 'बुवाई से पहले और शुरुआती बढ़वार की योजना',
    organic: 'मुख्य पोषण सुधार से पहले कम्पोस्ट या अच्छी तरह सड़ी गोबर खाद का उपयोग करें।',
    onionMineral: 'सल्फर + संतुलित NPK श्रेणी',
    defaultMineral: 'संतुलित NPK + फसल-विशेष सूक्ष्म पोषक श्रेणी',
    fertilizerTiming: 'मिट्टी की नमी जांचने के बाद ही दें; भारी बारिश से पहले उर्वरक न दें।',
    fertilizerSafety: 'मिट्टी जांच के बिना मात्रा नहीं बताई गई है। स्थानीय कृषि अधिकारी या उत्पाद लेबल का पालन करें।',
    fungalTitle: 'फफूंद दबाव बढ़ रहा है',
    fungalDetail: 'नमी और बारिश की संभावना ज्यादा है। निचली पत्तियों की जांच करें और अनावश्यक सिंचाई से बचें।',
    sprayTitle: 'छिड़काव का समय सुरक्षित नहीं',
    sprayDetail: 'हवा या बारिश से दवा बेकार जा सकती है। सूखे और कम हवा वाले समय का इंतजार करें।',
    heatTitle: 'गर्मी तनाव पर नजर रखें',
    heatDetail: 'सिंचाई सुबह जल्दी या शाम को करें और छोटे पौधों को दोपहर की गर्मी से बचाएं।',
    scanTitle: 'फॉलो-अप स्कैन जरूरी',
    scanDetail: (severity: string) => 'नए स्कैन में गंभीरता ' + severity + ' है। 2-3 दिन बाद फिर फोटो लें।',
    clearTitle: 'तुरंत बड़ा जोखिम नहीं',
    clearDetail: 'आज मौसम और स्कैन इतिहास में मजबूत चेतावनी संकेत नहीं है।',
  },
  mr: {
    planCrop: (crop: string, score: number) => crop + ' साठी योजना करा. पीक-लाभ स्कोर ' + score + '/100 आहे.',
    planReason: 'सल्ला हंगाम, पाण्याची गरज, हवामान धोका आणि बाजार शक्यता पाहून दिला आहे.',
    noSpray: 'आज फवारणी करू नका. सुरक्षित हवामान वेळेची वाट पाहा.',
    noSprayReason: (rain: number, wind: number) => 'पावसाचा धोका ' + rain + '% आणि वारा ' + wind + ' km/h पर्यंत आहे, त्यामुळे फवारणीचा परिणाम कमी होऊ शकतो.',
    inspectLeaves: 'आज पानांची तपासणी करा आणि रोग प्रतिबंधाची तयारी ठेवा.',
    inspectReason: 'आर्द्रता आणि पावसाचा नमुना दिसणाऱ्या नुकसानीपूर्वी बुरशीचा दबाव वाढवू शकतो.',
    floweringStage: 'फुलोरा आणि फळधारणा योजना',
    earlyStage: 'पेरणीपूर्व आणि सुरुवातीच्या वाढीची योजना',
    organic: 'मुख्य पोषण सुधारण्यापूर्वी कंपोस्ट किंवा चांगले कुजलेले शेणखत वापरा.',
    onionMineral: 'सल्फर + संतुलित NPK श्रेणी',
    defaultMineral: 'संतुलित NPK + पीक-विशेष सूक्ष्म अन्नद्रव्य श्रेणी',
    fertilizerTiming: 'मातीतील ओलावा तपासल्यानंतरच द्या; जोरदार पावसापूर्वी खत टाळा.',
    fertilizerSafety: 'माती तपासणीशिवाय मात्रा दाखवलेली नाही. स्थानिक कृषी अधिकारी किंवा उत्पादन लेबलचे पालन करा.',
    fungalTitle: 'बुरशीचा दबाव वाढतो आहे',
    fungalDetail: 'आर्द्रता आणि पावसाची शक्यता जास्त आहे. खालची पाने तपासा आणि अनावश्यक सिंचन टाळा.',
    sprayTitle: 'फवारणीची वेळ सुरक्षित नाही',
    sprayDetail: 'वारा किंवा पाऊस फवारणी वाया घालवू शकतो. कोरडा आणि कमी वाऱ्याचा वेळ येईपर्यंत थांबा.',
    heatTitle: 'उष्णता ताणावर लक्ष ठेवा',
    heatDetail: 'सिंचन सकाळी लवकर किंवा संध्याकाळी करा आणि लहान रोपे दुपारच्या उष्णतेपासून वाचवा.',
    scanTitle: 'फॉलो-अप स्कॅन आवश्यक',
    scanDetail: (severity: string) => 'नवीन स्कॅनमध्ये गंभीरता ' + severity + ' आहे. 2-3 दिवसांनी पुन्हा फोटो घ्या.',
    clearTitle: 'ताबडतोब मोठा धोका नाही',
    clearDetail: 'आज हवामान आणि स्कॅन इतिहासात मजबूत इशारा दिसत नाही.',
  },
};

function cropName(crop: string, lang: LanguageCode): string {
  return CROP_NAMES[crop]?.[lang] ?? crop;
}

function fertilizerFocusFor(crop: string, lang: LanguageCode): string[] {
  return FERTILIZER_FOCUS[crop]?.[lang] ?? FERTILIZER_FOCUS[crop]?.en ?? [];
}

function maxDaily(days: DailyWeather[], field: keyof Pick<DailyWeather, 'precipProbability' | 'windSpeedKmh' | 'maxTempC'>): number {
  return days.reduce((max, day) => Math.max(max, Number(day[field]) || 0), 0);
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function monthSeasonScore(crop: string, month: number): number {
  const kharif = month >= 6 && month <= 10;
  const rabi = month >= 10 || month <= 3;
  if (crop === 'Tomato') return kharif || rabi ? 16 : 10;
  if (crop === 'Onion') return rabi ? 18 : 8;
  if (crop === 'Soyabean') return kharif ? 18 : 6;
  if (crop === 'Cotton') return kharif ? 16 : 5;
  if (crop === 'Wheat') return rabi ? 16 : 5;
  return 10;
}

function waterFitScore(waterNeed: CropRecommendation['waterNeed'], rainRisk: number): number {
  if (waterNeed === 'low') return rainRisk > 65 ? 8 : 16;
  if (waterNeed === 'high') return rainRisk > 45 ? 16 : 10;
  return 14;
}

function marketSignal(score: number): CropRecommendation['profitSignal'] {
  if (score >= 78) return 'rising';
  if (score >= 64) return 'stable';
  return 'watch';
}

function buildCropRecommendations(forecast: WeatherForecast | null, lang: LanguageCode): CropRecommendation[] {
  const month = new Date().getMonth() + 1;
  const days = forecast?.daily ?? [];
  const rainRisk = maxDaily(days, 'precipProbability');
  const heatRisk = maxDaily(days, 'maxTempC');

  return CROP_CATALOG.map((crop) => {
    const season = monthSeasonScore(crop.crop, month);
    const water = waterFitScore(crop.waterNeed, rainRisk);
    const weatherFit = heatRisk > 40 && crop.crop !== 'Cotton' ? 8 : 14;
    const diseasePenalty = rainRisk > 70 ? crop.diseaseSensitivity : Math.round(crop.diseaseSensitivity / 2);
    const score = clamp(36 + crop.marketBase + season + water + weatherFit - diseasePenalty);
    const reasons = [
      `${crop.season} season fit`,
      `${crop.waterNeed} water demand suits current planning`,
      score >= 75 ? 'Strong profit and timing signal' : 'Needs price and weather monitoring',
    ];

    return {
      crop: crop.crop,
      localName: cropName(crop.crop, lang),
      score,
      season: crop.season,
      waterNeed: crop.waterNeed,
      profitSignal: marketSignal(score),
      reasons,
      fertilizerFocus: fertilizerFocusFor(crop.crop, lang),
    };
  }).sort((a, b) => b.score - a.score);
}

function buildFertilizerPlan(topCrop: CropRecommendation, lang: LanguageCode): FertilizerPlan {
  const copy = FARM_COPY[lang];
  const focus = topCrop.fertilizerFocus.join(', ');
  return {
    crop: topCrop.localName,
    stage: topCrop.crop === 'Tomato' ? copy.floweringStage : copy.earlyStage,
    priority: focus,
    organic: copy.organic,
    mineralCategory: topCrop.crop === 'Onion' ? copy.onionMineral : copy.defaultMineral,
    timing: copy.fertilizerTiming,
    safety: copy.fertilizerSafety,
  };
}
function buildPreventiveAlerts(forecast: WeatherForecast | null, scans: ScanHistoryItem[], lang: LanguageCode): PreventiveAlert[] {
  const days = forecast?.daily ?? [];
  const hourly = forecast?.hourly ?? [];
  const rainRisk = maxDaily(days, 'precipProbability');
  const windRisk = maxDaily(days, 'windSpeedKmh');
  const heatRisk = maxDaily(days, 'maxTempC');
  const humidHours = hourly.filter((hour) => hour.humidity > 82).length;
  const lastScan = scans[0];
  const scanRisk = lastScan && ['high', 'critical', 'medium'].includes(lastScan.severity);
  const copy = FARM_COPY[lang];

  const alerts: PreventiveAlert[] = [];
  if (rainRisk > 65 || humidHours > 8) {
    alerts.push({ title: copy.fungalTitle, detail: copy.fungalDetail, tone: 'danger' });
  }
  if (windRisk > 28 || rainRisk > 45) {
    alerts.push({ title: copy.sprayTitle, detail: copy.sprayDetail, tone: 'watch' });
  }
  if (heatRisk > 39) {
    alerts.push({ title: copy.heatTitle, detail: copy.heatDetail, tone: 'watch' });
  }
  if (scanRisk) {
    alerts.push({
      title: copy.scanTitle,
      detail: copy.scanDetail(lastScan.severity),
      tone: lastScan.severity === 'medium' ? 'watch' : 'danger',
    });
  }
  if (!alerts.length) {
    alerts.push({ title: copy.clearTitle, detail: copy.clearDetail, tone: 'good' });
  }
  return alerts.slice(0, 4);
}
export function buildFarmIntelligence(input: BuildInput): FarmIntelligence {
  const lang = input.lang ?? 'hi';
  const copy = FARM_COPY[lang];
  const cropRecommendations = buildCropRecommendations(input.forecast, lang);
  const topCrop = cropRecommendations[0];
  const days = input.forecast?.daily ?? [];
  const hourly = input.forecast?.hourly ?? [];
  const rainRisk = maxDaily(days, 'precipProbability');
  const windRisk = maxDaily(days, 'windSpeedKmh');
  const heatRisk = maxDaily(days, 'maxTempC');
  const humidHours = hourly.filter((hour) => hour.humidity > 82).length;
  const diseaseRisk: FarmIntelligence['diseaseRisk'] = rainRisk > 70 || humidHours > 10 ? 'high' : rainRisk > 40 || humidHours > 4 ? 'medium' : 'low';
  const readinessScore = clamp(88 - (rainRisk > 60 ? 14 : 0) - (windRisk > 28 ? 10 : 0) - (heatRisk > 39 ? 8 : 0) + Math.round(topCrop.score / 10));

  let todayAction = copy.planCrop(topCrop.localName, topCrop.score);
  let actionReason = copy.planReason;

  if (rainRisk > 55 || windRisk > 25) {
    todayAction = copy.noSpray;
    actionReason = copy.noSprayReason(Math.round(rainRisk), Math.round(windRisk));
  } else if (diseaseRisk === 'high') {
    todayAction = copy.inspectLeaves;
    actionReason = copy.inspectReason;
  }

  return {
    readinessScore,
    todayAction,
    actionReason,
    diseaseRisk,
    cropRecommendations,
    preventiveAlerts: buildPreventiveAlerts(input.forecast, input.scans, lang),
    fertilizerPlan: buildFertilizerPlan(topCrop, lang),
    educationCards: [
      {
        title: 'Crop selection rule',
        lesson: 'Do not choose only by last year price. Match season, water, soil, disease risk, and current mandi trend.',
        action: `Start with ${topCrop.localName}, then compare the next two crops before sowing.`,
      },
      {
        title: 'Fertilizer safety rule',
        lesson: 'Fertilizer should correct a crop need, not just increase greenness. Excess nitrogen can increase disease risk.',
        action: 'Use soil test guidance before deciding dosage.',
      },
      {
        title: 'Market timing rule',
        lesson: 'A higher mandi price is useful only after transport cost, harvest readiness, and spoilage risk are checked.',
        action: 'Compare modal price with nearby markets before selling.',
      },
    ],
  };
}
