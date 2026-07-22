import { z } from 'zod';

export const sprayLockTelemetrySchema = z.object({
  deviceId: z.string().regex(/^ANV-SL-[A-Z0-9-]{4,24}$/),
  sequence: z.number().int().nonnegative(),
  capturedAt: z.string().datetime(),
  source: z.enum(['device', 'simulated']),
  windSpeedKmh: z.number().min(0).max(180),
  humidityPercent: z.number().min(0).max(100),
  pressureBar: z.number().min(0).max(12),
  flowStable: z.boolean(),
  nozzleHealthPercent: z.number().min(0).max(100),
  batteryPercent: z.number().min(0).max(100),
  calibrationAgeDays: z.number().int().min(0).max(3650),
  firmwareVersion: z.string().min(1).max(40),
  attestation: z.object({
    keyId: z.string().min(1).max(80),
    signature: z.string().max(2048).optional(),
  }),
});

export const sprayLockWeatherSchema = z.object({
  capturedAt: z.string().datetime(),
  source: z.enum(['live', 'cached', 'simulated']),
  windSpeedKmh: z.number().min(0).max(180),
  precipitationProbability: z.number().min(0).max(100),
});

export const sprayLockPreflightSchema = z.object({
  telemetry: sprayLockTelemetrySchema,
  weather: sprayLockWeatherSchema,
  fieldId: z.string().min(1).max(120),
  farmId: z.string().min(1).max(120),
});

export type SprayLockTelemetry = z.infer<typeof sprayLockTelemetrySchema>;
export type SprayLockWeather = z.infer<typeof sprayLockWeatherSchema>;
export type SprayLockPreflightInput = z.infer<typeof sprayLockPreflightSchema>;

export type SprayLockReasonCode =
  | 'wind_high'
  | 'rain_risk'
  | 'sensor_disagreement'
  | 'reading_stale'
  | 'calibration_due'
  | 'flow_unstable'
  | 'nozzle_service_due'
  | 'battery_low';

export type SprayLockDecision = 'ready' | 'inspect' | 'blocked';

export type SprayLockEvaluation = {
  decision: SprayLockDecision;
  interlockEngaged: boolean;
  confidencePercent: number;
  reasonCodes: SprayLockReasonCode[];
  sensorAgreementKmh: number;
  readingAgeSeconds: number;
};

const LIMITS = {
  maximumWindKmh: 16,
  maximumRainProbability: 35,
  maximumSensorDeltaKmh: 8,
  maximumReadingAgeSeconds: 300,
  maximumCalibrationAgeDays: 30,
  minimumNozzleHealthPercent: 85,
  minimumBatteryPercent: 15,
} as const;

export function evaluateSprayLockPreflight(
  input: SprayLockPreflightInput,
  now: Date = new Date(),
): SprayLockEvaluation {
  const blockingReasons: SprayLockReasonCode[] = [];
  const inspectionReasons: SprayLockReasonCode[] = [];
  const readingAgeSeconds = Math.max(
    0,
    Math.round((now.getTime() - new Date(input.telemetry.capturedAt).getTime()) / 1000),
  );
  const sensorAgreementKmh = Number(
    Math.abs(input.telemetry.windSpeedKmh - input.weather.windSpeedKmh).toFixed(1),
  );

  if (input.telemetry.windSpeedKmh > LIMITS.maximumWindKmh) blockingReasons.push('wind_high');
  if (input.weather.precipitationProbability >= LIMITS.maximumRainProbability) blockingReasons.push('rain_risk');
  if (!input.telemetry.flowStable) blockingReasons.push('flow_unstable');
  if (input.telemetry.nozzleHealthPercent < LIMITS.minimumNozzleHealthPercent) blockingReasons.push('nozzle_service_due');

  if (sensorAgreementKmh > LIMITS.maximumSensorDeltaKmh) inspectionReasons.push('sensor_disagreement');
  if (readingAgeSeconds > LIMITS.maximumReadingAgeSeconds) inspectionReasons.push('reading_stale');
  if (input.telemetry.calibrationAgeDays > LIMITS.maximumCalibrationAgeDays) inspectionReasons.push('calibration_due');
  if (input.telemetry.batteryPercent < LIMITS.minimumBatteryPercent) inspectionReasons.push('battery_low');

  const reasonCodes = [...blockingReasons, ...inspectionReasons];
  const confidencePenalty =
    Math.min(24, sensorAgreementKmh * 2)
    + (readingAgeSeconds > LIMITS.maximumReadingAgeSeconds ? 18 : 0)
    + (input.telemetry.calibrationAgeDays > LIMITS.maximumCalibrationAgeDays ? 18 : 0)
    + (input.telemetry.source === 'simulated' ? 12 : 0);
  const confidencePercent = Math.max(35, Math.round(96 - confidencePenalty));

  if (blockingReasons.length) {
    return {
      decision: 'blocked',
      interlockEngaged: true,
      confidencePercent,
      reasonCodes,
      sensorAgreementKmh,
      readingAgeSeconds,
    };
  }

  if (inspectionReasons.length) {
    return {
      decision: 'inspect',
      interlockEngaged: true,
      confidencePercent,
      reasonCodes,
      sensorAgreementKmh,
      readingAgeSeconds,
    };
  }

  return {
    decision: 'ready',
    interlockEngaged: false,
    confidencePercent,
    reasonCodes,
    sensorAgreementKmh,
    readingAgeSeconds,
  };
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

export function canonicalizeSprayLockPayload(value: unknown): string {
  return JSON.stringify(canonicalizeValue(value));
}

export function deviceSignaturePayload(telemetry: SprayLockTelemetry): string {
  const { attestation, ...measurement } = telemetry;
  return canonicalizeSprayLockPayload({
    ...measurement,
    keyId: attestation.keyId,
  });
}
