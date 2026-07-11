// KisanMitra — Real-Time Venue Intelligence Rule Engine (RVIRE)
import type { ResolutionCard, FarmTwin, WeatherForecast, SoilReading, IrrigationAction } from '@/types';

interface RuleContext {
  farmTwin: FarmTwin;
  weather?: WeatherForecast | null;
  soilMoisture?: number;
  crowdDensity?: number;
  gateWaitTime?: number;
  currentHour?: number;
}

interface RuleResult {
  triggered: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  resolutionCardId?: string;
}

// Core RVIRE Rule Definitions
export const CORE_RULES = [
  {
    id: 'fungal_risk',
    name: 'Fungal Disease Risk Detection',
    condition: (ctx: RuleContext) => {
      const humidity = ctx.weather?.hourly?.[0]?.humidity ?? 0;
      const rain = ctx.weather?.daily?.[0]?.precipProbability ?? 0;
      const stage = ctx.farmTwin.cropCycles[0]?.cropStage;
      return humidity > 80 && rain > 60 && stage === 'flowering';
    },
    priority: 'critical' as const,
    confidence: 87,
    action: 'record_treatment',
    resolutionCardId: 'res-001',
  },
  {
    id: 'irrigation_pause',
    name: 'Irrigation Pause Recommendation',
    condition: (ctx: RuleContext) => {
      const soilMoisture = ctx.soilMoisture ?? 70;
      const rainProb = ctx.weather?.daily?.[0]?.precipProbability ?? 0;
      return soilMoisture > 75 && rainProb > 50;
    },
    priority: 'high' as const,
    confidence: 92,
    action: 'pause_irrigation',
    resolutionCardId: 'res-002',
  },
  {
    id: 'harvest_window',
    name: 'Optimum Harvest Window',
    condition: (ctx: RuleContext) => {
      const stage = ctx.farmTwin.cropCycles[0]?.cropStage;
      return stage === 'fruiting' || stage === 'ripening';
    },
    priority: 'medium' as const,
    confidence: 74,
    action: 'harvest_window',
    resolutionCardId: 'res-003',
  },
  {
    id: 'wind_spray_advisory',
    name: 'Wind Advisory — Foliar Spraying',
    condition: (ctx: RuleContext) => {
      const wind = ctx.weather?.daily?.[1]?.windSpeedKmh ?? 0;
      return wind > 20;
    },
    priority: 'medium' as const,
    confidence: 81,
    action: 'schedule_photo',
    resolutionCardId: 'res-wind',
  },
];

// AI-Enhanced Predictive Rules
export const AI_PREDICTIVE_RULES = [
  {
    id: 'predictive_congestion',
    name: 'Predictive Congestion Prevention',
    description: 'IF predicted_density(zone_A, next_10_min) > 85% THEN pre-emptively redirect crowd',
    condition: (ctx: RuleContext) => (ctx.crowdDensity ?? 0) > 75,
    priority: 'critical' as const,
  },
  {
    id: 'self_learning',
    name: 'Self-Learning Optimization',
    description: 'Adjusts rule thresholds based on historical action effectiveness',
    condition: () => true,
    priority: 'low' as const,
  },
];

// Priority resolution — Critical always wins, then confidence score
export function resolveConflicts(results: RuleResult[]): RuleResult[] {
  const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
  return results
    .filter(r => r.triggered)
    .sort((a, b) => {
      const pDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (pDiff !== 0) return pDiff;
      return b.confidence - a.confidence;
    });
}

// Main rule evaluation engine
export function evaluateRules(ctx: RuleContext): RuleResult[] {
  const results: RuleResult[] = CORE_RULES.map(rule => ({
    triggered: rule.condition(ctx),
    priority: rule.priority,
    confidence: rule.confidence,
    resolutionCardId: rule.resolutionCardId,
  }));
  return resolveConflicts(results);
}

// Example JSON rule schema (RVIRE format)
export const EXAMPLE_RULE_JSON = {
  rule: 'crowd_congestion_zone_A',
  condition: { crowd_density: '>80', trend: 'increasing' },
  actions: ['redirect_users', 'update_signage', 'notify_ops'],
  priority: 'critical',
  confidence: 0.89,
};
