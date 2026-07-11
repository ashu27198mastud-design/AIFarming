import type { DailyWeather, WeatherForecast } from '@/types';
import type { ScanHistoryItem } from '@/components/tabs/HomeTab';

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

function buildCropRecommendations(forecast: WeatherForecast | null): CropRecommendation[] {
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
      localName: crop.localName,
      score,
      season: crop.season,
      waterNeed: crop.waterNeed,
      profitSignal: marketSignal(score),
      reasons,
      fertilizerFocus: crop.fertilizerFocus,
    };
  }).sort((a, b) => b.score - a.score);
}

function buildFertilizerPlan(topCrop: CropRecommendation): FertilizerPlan {
  const focus = topCrop.fertilizerFocus.join(', ');
  return {
    crop: topCrop.localName,
    stage: topCrop.crop === 'Tomato' ? 'Flowering and fruit-set planning' : 'Pre-sowing and early growth planning',
    priority: focus,
    organic: 'Use compost or well-decomposed farmyard manure before major nutrient correction.',
    mineralCategory: topCrop.crop === 'Onion' ? 'Sulphur + balanced NPK category' : 'Balanced NPK + crop-specific micronutrient category',
    timing: 'Apply only after soil moisture check; avoid fertilizer before heavy rain.',
    safety: 'No dosage is shown without soil test. Follow local agriculture officer or product label.',
  };
}

function buildPreventiveAlerts(forecast: WeatherForecast | null, scans: ScanHistoryItem[]): PreventiveAlert[] {
  const days = forecast?.daily ?? [];
  const hourly = forecast?.hourly ?? [];
  const rainRisk = maxDaily(days, 'precipProbability');
  const windRisk = maxDaily(days, 'windSpeedKmh');
  const heatRisk = maxDaily(days, 'maxTempC');
  const humidHours = hourly.filter((hour) => hour.humidity > 82).length;
  const lastScan = scans[0];
  const scanRisk = lastScan && ['high', 'critical', 'medium'].includes(lastScan.severity);

  const alerts: PreventiveAlert[] = [];
  if (rainRisk > 65 || humidHours > 8) {
    alerts.push({
      title: 'Fungal pressure building',
      detail: 'Humidity and rain probability are high. Inspect lower leaves and avoid unnecessary irrigation.',
      tone: 'danger',
    });
  }
  if (windRisk > 28 || rainRisk > 45) {
    alerts.push({
      title: 'Spray timing blocked',
      detail: 'Wind or rain can waste spray and reduce protection. Wait for a dry low-wind window.',
      tone: 'watch',
    });
  }
  if (heatRisk > 39) {
    alerts.push({
      title: 'Heat stress watch',
      detail: 'Shift irrigation to early morning or evening and protect young plants from midday stress.',
      tone: 'watch',
    });
  }
  if (scanRisk) {
    alerts.push({
      title: 'Follow-up scan needed',
      detail: `Latest scan shows ${lastScan.severity} severity. Capture another photo after 2-3 days.`,
      tone: lastScan.severity === 'medium' ? 'watch' : 'danger',
    });
  }
  if (!alerts.length) {
    alerts.push({
      title: 'No major immediate risk',
      detail: 'Weather and scan history do not show a strong warning signal today.',
      tone: 'good',
    });
  }
  return alerts.slice(0, 4);
}

export function buildFarmIntelligence(input: BuildInput): FarmIntelligence {
  const cropRecommendations = buildCropRecommendations(input.forecast);
  const topCrop = cropRecommendations[0];
  const days = input.forecast?.daily ?? [];
  const hourly = input.forecast?.hourly ?? [];
  const rainRisk = maxDaily(days, 'precipProbability');
  const windRisk = maxDaily(days, 'windSpeedKmh');
  const heatRisk = maxDaily(days, 'maxTempC');
  const humidHours = hourly.filter((hour) => hour.humidity > 82).length;
  const diseaseRisk: FarmIntelligence['diseaseRisk'] = rainRisk > 70 || humidHours > 10 ? 'high' : rainRisk > 40 || humidHours > 4 ? 'medium' : 'low';
  const readinessScore = clamp(88 - (rainRisk > 60 ? 14 : 0) - (windRisk > 28 ? 10 : 0) - (heatRisk > 39 ? 8 : 0) + Math.round(topCrop.score / 10));

  let todayAction = `Plan ${topCrop.localName} with a ${topCrop.score}/100 crop-profit score.`;
  let actionReason = 'Best recommendation combines season, water need, weather risk, and market potential.';

  if (rainRisk > 55 || windRisk > 25) {
    todayAction = 'Do not spray today. Wait for the safe weather window.';
    actionReason = `Rain risk ${Math.round(rainRisk)}% and wind up to ${Math.round(windRisk)} km/h can reduce spray effectiveness.`;
  } else if (diseaseRisk === 'high') {
    todayAction = 'Inspect leaves today and prepare preventive disease control.';
    actionReason = 'Humidity and rain pattern can trigger fungal pressure before visible loss appears.';
  }

  return {
    readinessScore,
    todayAction,
    actionReason,
    diseaseRisk,
    cropRecommendations,
    preventiveAlerts: buildPreventiveAlerts(input.forecast, input.scans),
    fertilizerPlan: buildFertilizerPlan(topCrop),
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
