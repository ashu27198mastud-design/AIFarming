// AETHER AG — Complete TypeScript Type Definitions

export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low';
export type DataSourceType = 'live' | 'cached' | 'simulated';
export type IrrigationMode = 'advisory' | 'approval' | 'automation';
export type DroneStatus = 'idle' | 'preflight' | 'flying' | 'returning' | 'charging' | 'offline';
export type MissionType = 'inspection' | 'spraying' | 'mapping';
export type CropStage = 'germination' | 'seedling' | 'vegetative' | 'flowering' | 'fruiting' | 'ripening' | 'harvest';
export type RiskType = 'fungal' | 'drought' | 'waterlogging' | 'frost' | 'heat' | 'wind' | 'pest' | 'disease';
export type VerificationStatus = 'pending' | 'improved' | 'no_change' | 'worsened' | 'more_evidence_needed';
export type FarmMode = 'small_plot' | 'commercial' | 'industrial';

export interface GeoCoordinates {
  lat: number;
  lng: number;
}

export interface FieldBoundary {
  type: 'Polygon';
  coordinates: [number, number][][];
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  language: string;
  farmMode: FarmMode;
  countryCode: string;
  createdAt: Date;
}

export interface Organisation {
  id: string;
  name: string;
  type: 'cooperative' | 'fpo' | 'enterprise' | 'institution';
  country: string;
  memberCount: number;
}

export interface CountryPack {
  code: string;
  name: string;
  flag: string;
  currency: string;
  areaUnit: string;
  weightUnit: string;
  temperatureUnit: 'C' | 'F';
  language: string;
  cropCalendar: string[];
  marketConnectors: string[];
  weatherSource: string;
  agronomicReferences: string[];
  demoFarmer: string;
  demoRegion: string;
}

export interface SoilCharacteristics {
  type: 'clay' | 'loam' | 'sandy' | 'silt' | 'peat';
  ph: number;
  organicMatter: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  waterRetention: 'low' | 'medium' | 'high';
}

export interface Field {
  id: string;
  farmId: string;
  name: string;
  areaHectares: number;
  boundary: FieldBoundary;
  centroid: GeoCoordinates;
  soilCharacteristics: SoilCharacteristics;
  irrigationMethod: 'drip' | 'sprinkler' | 'flood' | 'furrow' | 'none';
  waterSource: 'borewell' | 'canal' | 'rain' | 'pond' | 'municipal';
  currentCropCycleId?: string;
}

export interface CropCycle {
  id: string;
  fieldId: string;
  farmId: string;
  cropName: string;
  cropVariety: string;
  sowingDate: string;
  expectedHarvestDate: string;
  actualHarvestDate?: string;
  cropStage: CropStage;
  estimatedYieldTons: number;
  actualYieldTons?: number;
  inputCostPerHectare: number;
  notes: string;
}

export interface FarmTwin {
  id: string;
  farmId: string;
  farmerName: string;
  organisationId?: string;
  country: string;
  region: string;
  farmName: string;
  farmSizeHectares: number;
  farmMode: FarmMode;
  countryCode: string;
  fields: Field[];
  cropCycles: CropCycle[];
  historicalYield: YieldRecord[];
  pestIncidents: PestIncident[];
  treatments: Treatment[];
  observations: Observation[];
  activityTimeline: TimelineEvent[];
  lastUpdated: string;
  dataQualityScore: number;
}

export interface YieldRecord {
  year: number;
  fieldId: string;
  cropName: string;
  yieldTons: number;
  salePrice: number;
  netRevenue: number;
}

export interface PestIncident {
  id: string;
  fieldId: string;
  date: string;
  type: 'pest' | 'disease' | 'deficiency';
  name: string;
  severity: 'low' | 'medium' | 'high';
  treatmentApplied: string;
  outcome: string;
}

export interface Treatment {
  id: string;
  fieldId: string;
  date: string;
  type: 'fertilizer' | 'pesticide' | 'biological' | 'irrigation' | 'other';
  product: string;
  quantity: number;
  unit: string;
  appliedBy: string;
  linkedResolutionCardId?: string;
}

export interface Observation {
  id: string;
  farmId: string;
  fieldId: string;
  type: 'satellite' | 'drone' | 'ground_image' | 'manual';
  timestamp: string;
  ndviValue?: number;
  stressLevel?: 'none' | 'low' | 'medium' | 'high' | 'critical';
  imageUrl?: string;
  notes: string;
  dataSource: DataSourceType;
}

export interface SatelliteObservation {
  id: string;
  fieldId: string;
  timestamp: string;
  ndviValue: number;
  ndwiValue: number;
  stressZones: StressZone[];
  vegetationIndex: 'healthy' | 'moderate' | 'stressed' | 'critical';
  dataSource: DataSourceType;
}

export interface StressZone {
  boundary: FieldBoundary;
  stressType: string;
  severity: 'low' | 'medium' | 'high';
  affectedAreaPercent: number;
}

export interface DroneMission {
  id: string;
  farmId: string;
  fieldId: string;
  missionType: MissionType;
  status: DroneStatus | 'completed' | 'cancelled' | 'scheduled';
  scheduledAt: string;
  startedAt?: string;
  completedAt?: string;
  flightPath: GeoCoordinates[];
  altitudeMeters: number;
  coveragePercent: number;
  batteryStart: number;
  batteryEnd?: number;
  observations: string[];
  dataSource: DataSourceType;
  weatherSuitable: boolean;
  pilotNote: string;
}

export interface DroneTelemetry {
  missionId: string;
  timestamp: string;
  position: GeoCoordinates;
  altitudeMeters: number;
  batteryPercent: number;
  speedKmh: number;
  heading: number;
  signalStrength: number;
  coveragePercent: number;
}

export interface WeatherForecast {
  fieldId: string;
  location: GeoCoordinates;
  fetchedAt: string;
  dataSource: DataSourceType;
  hourly: HourlyWeather[];
  daily: DailyWeather[];
  alerts: WeatherAlert[];
}

export interface HourlyWeather {
  time: string;
  temperatureC: number;
  humidity: number;
  precipMm: number;
  precipProbability: number;
  windSpeedKmh: number;
  soilMoisture: number;
  evapotranspirationMm: number;
}

export interface DailyWeather {
  date: string;
  maxTempC: number;
  minTempC: number;
  precipMm: number;
  precipProbability: number;
  windSpeedKmh: number;
  humidityMean: number;
  uvIndex: number;
  sunrise: string;
  sunset: string;
}

export interface WeatherAlert {
  type: RiskType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  startsAt: string;
  endsAt: string;
  affectedFields: string[];
}

export interface ClimateRisk {
  id: string;
  farmId: string;
  fieldId: string;
  riskType: RiskType;
  riskLevel: PriorityLevel;
  title: string;
  description: string;
  affectedTimeWindow: string;
  reason: string;
  confidence: number;
  recommendedAction: string;
  consequenceOfDelay: string;
  dataSource: DataSourceType;
  createdAt: string;
}

export interface SoilReading {
  id: string;
  fieldId: string;
  timestamp: string;
  moisturePercent: number;
  temperatureC: number;
  ph: number;
  electricalConductivity: number;
  dataSource: DataSourceType;
}

export interface IrrigationAction {
  id: string;
  fieldId: string;
  farmId: string;
  mode: IrrigationMode;
  status: 'recommended' | 'pending_approval' | 'approved' | 'active' | 'completed' | 'cancelled' | 'paused';
  targetFieldName: string;
  waterQuantityLiters: number;
  durationMinutes: number;
  reason: string;
  rainAdjusted: boolean;
  waterSavedLiters: number;
  costSavedINR: number;
  confidence: number;
  scheduledAt: string;
  completedAt?: string;
  linkedResolutionCardId?: string;
  dataSource: DataSourceType;
}

export interface MarketPrice {
  id: string;
  cropName: string;
  market: string;
  pricePerKg: number;
  currency: string;
  date: string;
  trend: 'rising' | 'falling' | 'stable';
  dataSource: DataSourceType;
}

export interface HarvestScenario {
  id: string;
  farmId: string;
  cropCycleId: string;
  label: string;
  harvestDate: string;
  estimatedYieldTons: number;
  estimatedPricePerKg: number;
  estimatedGrossRevenue: number;
  logisticsCost: number;
  storageCost: number;
  estimatedNetRevenue: number;
  weatherRisk: 'low' | 'medium' | 'high';
  marketOpportunity: string;
  confidence: number;
  recommended: boolean;
  dataSource: DataSourceType;
}

export interface ResolutionCard {
  id: string;
  farmId: string;
  fieldId: string;
  priority: PriorityLevel;
  title: string;
  detected: string;
  mayHappen: string;
  recommendation: string;
  why: string;
  whenToAct: string;
  expectedBenefit: string;
  estimatedCost: string;
  riskOfDelay: string;
  confidence: number;
  dataSources: string[];
  dataSource: DataSourceType;
  alternatives: string[];
  requiresApproval: boolean;
  followUpVerification: string;
  actionType: 'pause_irrigation' | 'schedule_irrigation' | 'field_inspection' | 'deploy_drone' | 'record_treatment' | 'notify_worker' | 'harvest_window' | 'market_compare' | 'request_agronomist' | 'schedule_photo';
  status: 'active' | 'approved' | 'dismissed' | 'completed' | 'snoozed';
  createdAt: string;
  approvedAt?: string;
  linkedActionId?: string;
}

export interface CropDiagnosis {
  id: string;
  farmId: string;
  fieldId: string;
  imageUrl: string;
  mostLikelyIssue: string;
  alternativePossibilities: string[];
  confidence: number;
  visibleIndicators: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  urgency: 'routine' | 'soon' | 'urgent' | 'immediate';
  questionsForAccuracy: string[];
  immediateAction: string;
  organicOptions: string[];
  chemicalCategory?: string;
  preventionAdvice: string;
  followUpDays: number;
  requiresExpert: boolean;
  dataSource: DataSourceType;
  timestamp: string;
}

export interface OutcomeVerification {
  id: string;
  resolutionCardId: string;
  farmId: string;
  fieldId: string;
  actionTaken: string;
  beforeCondition: string;
  afterCondition?: string;
  beforeImageUrl?: string;
  afterImageUrl?: string;
  evidenceType: 'photo' | 'soil_reading' | 'drone_scan' | 'farmer_feedback' | 'harvest_result';
  status: VerificationStatus;
  improvementScore?: number;
  remainingRisk?: string;
  nextRecommendedAction?: string;
  scheduledAt: string;
  completedAt?: string;
  farmerFeedback?: string;
}

export interface TimelineEvent {
  id: string;
  farmId: string;
  fieldId?: string;
  timestamp: string;
  type: 'observation' | 'resolution' | 'treatment' | 'irrigation' | 'drone_mission' | 'weather_event' | 'market_action' | 'verification' | 'ai_recommendation';
  title: string;
  description: string;
  priority?: PriorityLevel;
  linkedEntityId?: string;
  dataSource: DataSourceType;
}

export interface YieldOutlook {
  currentOutlook: 'excellent' | 'good' | 'moderate' | 'poor' | 'critical';
  yieldRangeLow: number;
  yieldRangeHigh: number;
  unit: string;
  confidence: number;
  mainLimitingFactor: string;
  recommendedIntervention: string;
  estimatedValueProtectedINR: number;
  dataQualityIndicator: 'high' | 'medium' | 'low';
  dataSource: DataSourceType;
}

export interface StreamCard {
  id: string;
  priority: PriorityLevel;
  type: 'weather' | 'crop_stress' | 'irrigation' | 'market' | 'drone' | 'yield' | 'task' | 'verification';
  title: string;
  subtitle: string;
  fieldName: string;
  predictedTime: string;
  financialImpact: string;
  confidence: number;
  dataSources: string[];
  dataSource: DataSourceType;
  resolutionCardId: string;
  actionLabel: string;
  dismissed: boolean;
  createdAt: string;
}

export interface ResearchExperiment {
  id: string;
  name: string;
  type: 'acoustic_levitation' | 'biochar' | 'precision_fermentation';
  status: 'running' | 'paused' | 'completed';
  frequencyKhz?: number;
  pressurePa?: number;
  seedMassGrams?: number;
  stabilityPercent?: number;
  nutrientDistribution?: number;
  exposureDurationSec?: number;
  temperature?: number;
  humidity?: number;
  dataSource: DataSourceType;
  disclaimer: string;
}

export interface AetherChatMessage {
  id: string;
  role: 'user' | 'aether';
  content: string;
  imageUrl?: string;
  timestamp: string;
  contextUsed?: string[];
}
