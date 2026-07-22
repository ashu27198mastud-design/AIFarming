import { z } from 'zod';

export const droneTelemetrySchema = z.object({
  deviceId: z.string().regex(/^ANV-DR-[A-Z0-9-]{4,24}$/),
  sequence: z.number().int().nonnegative(),
  capturedAt: z.string().datetime(),
  source: z.enum(['device', 'simulated']),
  batteryPercent: z.number().min(0).max(100),
  gpsAccuracyM: z.number().min(0).max(100),
  satelliteCount: z.number().int().min(0).max(64),
  linkQualityPercent: z.number().min(0).max(100),
  motorHealthPercent: z.number().min(0).max(100),
  storageAvailablePercent: z.number().min(0).max(100),
  calibrationAgeDays: z.number().int().min(0).max(3650),
  homePointSet: z.boolean(),
  returnPathClear: z.boolean(),
  withinApprovedGeofence: z.boolean(),
  firmwareVersion: z.string().min(1).max(40),
  attestation: z.object({
    keyId: z.string().min(1).max(80),
    signature: z.string().max(2048).optional(),
  }),
});

export const droneWeatherSchema = z.object({
  capturedAt: z.string().datetime(),
  source: z.enum(['live', 'cached', 'simulated']),
  windSpeedKmh: z.number().min(0).max(180),
  precipitationProbability: z.number().min(0).max(100),
});

export const dronePreflightSchema = z.object({
  farmId: z.string().min(1).max(120),
  fieldId: z.string().min(1).max(120),
  routeChecksum: z.string().regex(/^[a-f0-9]{16,128}$/),
  missionType: z.enum(['inspection', 'mapping', 'spraying']),
  operatorVerified: z.boolean(),
  telemetry: droneTelemetrySchema,
  weather: droneWeatherSchema,
});

export type DroneTelemetryInput = z.infer<typeof droneTelemetrySchema>;
export type DronePreflightInput = z.infer<typeof dronePreflightSchema>;
export type DroneMissionType = DronePreflightInput['missionType'];

export type DroneReasonCode =
  | 'battery_reserve_low'
  | 'gps_accuracy_low'
  | 'satellite_lock_weak'
  | 'link_quality_low'
  | 'motor_service_due'
  | 'storage_low'
  | 'calibration_due'
  | 'home_point_missing'
  | 'return_path_blocked'
  | 'outside_geofence'
  | 'wind_high'
  | 'rain_risk'
  | 'reading_stale'
  | 'operator_required';

export type DronePreflightEvaluation = {
  decision: 'ready' | 'inspect' | 'blocked';
  launchLockEngaged: boolean;
  confidencePercent: number;
  reasonCodes: DroneReasonCode[];
  readingAgeSeconds: number;
};

const LIMITS = {
  minimumBatteryPercent: 35,
  maximumGpsAccuracyM: 5,
  minimumSatelliteCount: 8,
  minimumLinkQualityPercent: 55,
  minimumMotorHealthPercent: 85,
  minimumStorageAvailablePercent: 10,
  maximumCalibrationAgeDays: 30,
  maximumWindKmh: 25,
  maximumRainProbability: 40,
  maximumReadingAgeSeconds: 120,
} as const;

export function evaluateDronePreflight(
  input: DronePreflightInput,
  now: Date = new Date(),
): DronePreflightEvaluation {
  const blocked: DroneReasonCode[] = [];
  const inspect: DroneReasonCode[] = [];
  const readingAgeSeconds = Math.max(
    0,
    Math.round((now.getTime() - new Date(input.telemetry.capturedAt).getTime()) / 1000),
  );

  if (input.telemetry.batteryPercent < LIMITS.minimumBatteryPercent) blocked.push('battery_reserve_low');
  if (input.telemetry.gpsAccuracyM > LIMITS.maximumGpsAccuracyM) blocked.push('gps_accuracy_low');
  if (input.telemetry.motorHealthPercent < LIMITS.minimumMotorHealthPercent) blocked.push('motor_service_due');
  if (!input.telemetry.homePointSet) blocked.push('home_point_missing');
  if (!input.telemetry.returnPathClear) blocked.push('return_path_blocked');
  if (!input.telemetry.withinApprovedGeofence) blocked.push('outside_geofence');
  if (input.weather.windSpeedKmh > LIMITS.maximumWindKmh) blocked.push('wind_high');
  if (input.weather.precipitationProbability >= LIMITS.maximumRainProbability) blocked.push('rain_risk');
  if (input.missionType === 'spraying' && !input.operatorVerified) blocked.push('operator_required');

  if (input.telemetry.satelliteCount < LIMITS.minimumSatelliteCount) inspect.push('satellite_lock_weak');
  if (input.telemetry.linkQualityPercent < LIMITS.minimumLinkQualityPercent) inspect.push('link_quality_low');
  if (input.telemetry.storageAvailablePercent < LIMITS.minimumStorageAvailablePercent) inspect.push('storage_low');
  if (input.telemetry.calibrationAgeDays > LIMITS.maximumCalibrationAgeDays) inspect.push('calibration_due');
  if (readingAgeSeconds > LIMITS.maximumReadingAgeSeconds) inspect.push('reading_stale');

  const reasonCodes = [...blocked, ...inspect];
  const confidencePenalty =
    (input.telemetry.source === 'simulated' ? 12 : 0)
    + (readingAgeSeconds > LIMITS.maximumReadingAgeSeconds ? 18 : 0)
    + (input.telemetry.calibrationAgeDays > LIMITS.maximumCalibrationAgeDays ? 16 : 0)
    + (input.telemetry.linkQualityPercent < LIMITS.minimumLinkQualityPercent ? 12 : 0)
    + (input.telemetry.satelliteCount < LIMITS.minimumSatelliteCount ? 10 : 0);
  const confidencePercent = Math.max(35, 96 - confidencePenalty);

  if (blocked.length) {
    return { decision: 'blocked', launchLockEngaged: true, confidencePercent, reasonCodes, readingAgeSeconds };
  }
  if (inspect.length) {
    return { decision: 'inspect', launchLockEngaged: true, confidencePercent, reasonCodes, readingAgeSeconds };
  }
  return { decision: 'ready', launchLockEngaged: false, confidencePercent, reasonCodes, readingAgeSeconds };
}

function canonicalizeValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalizeValue);
  if (value && typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((result, key) => {
        result[key] = canonicalizeValue((value as Record<string, unknown>)[key]);
        return result;
      }, {});
  }
  return value;
}

export function canonicalizeDronePayload(value: unknown): string {
  return JSON.stringify(canonicalizeValue(value));
}

export function droneSignaturePayload(telemetry: DroneTelemetryInput): string {
  const { attestation, ...measurement } = telemetry;
  return canonicalizeDronePayload({ ...measurement, keyId: attestation.keyId });
}
