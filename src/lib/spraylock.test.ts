import { describe, expect, it } from 'vitest';
import {
  canonicalizeSprayLockPayload,
  evaluateSprayLockPreflight,
  type SprayLockPreflightInput,
} from './spraylock';

const NOW = new Date('2026-07-21T08:30:00.000Z');

function makeInput(overrides?: Partial<SprayLockPreflightInput>): SprayLockPreflightInput {
  return {
    farmId: 'farm-asha-001',
    fieldId: 'field-north',
    telemetry: {
      deviceId: 'ANV-SL-0248',
      sequence: 248,
      capturedAt: '2026-07-21T08:29:30.000Z',
      source: 'device',
      windSpeedKmh: 9,
      humidityPercent: 72,
      pressureBar: 2.8,
      flowStable: true,
      nozzleHealthPercent: 94,
      batteryPercent: 78,
      calibrationAgeDays: 12,
      firmwareVersion: '0.3.0',
      attestation: { keyId: 'field-key-0248' },
    },
    weather: {
      capturedAt: '2026-07-21T08:25:00.000Z',
      source: 'live',
      windSpeedKmh: 11,
      precipitationProbability: 12,
    },
    ...overrides,
  };
}

describe('evaluateSprayLockPreflight', () => {
  it('releases the interlock only when field and weather checks are safe', () => {
    const result = evaluateSprayLockPreflight(makeInput(), NOW);
    expect(result.decision).toBe('ready');
    expect(result.interlockEngaged).toBe(false);
    expect(result.reasonCodes).toEqual([]);
  });

  it('engages the interlock when wind or rain conditions are unsafe', () => {
    const input = makeInput();
    input.telemetry.windSpeedKmh = 22;
    input.weather.precipitationProbability = 64;
    const result = evaluateSprayLockPreflight(input, NOW);
    expect(result.decision).toBe('blocked');
    expect(result.reasonCodes).toEqual(expect.arrayContaining(['wind_high', 'rain_risk']));
  });

  it('requires inspection when independent wind sources disagree', () => {
    const input = makeInput();
    input.telemetry.windSpeedKmh = 4;
    input.weather.windSpeedKmh = 18;
    const result = evaluateSprayLockPreflight(input, NOW);
    expect(result.decision).toBe('inspect');
    expect(result.interlockEngaged).toBe(true);
    expect(result.reasonCodes).toContain('sensor_disagreement');
  });

  it('requires inspection for stale calibration', () => {
    const input = makeInput();
    input.telemetry.calibrationAgeDays = 45;
    const result = evaluateSprayLockPreflight(input, NOW);
    expect(result.decision).toBe('inspect');
    expect(result.reasonCodes).toContain('calibration_due');
  });
});

describe('canonicalizeSprayLockPayload', () => {
  it('produces the same evidence payload regardless of property order', () => {
    expect(canonicalizeSprayLockPayload({ z: 2, a: { y: 1, x: 0 } })).toBe(
      canonicalizeSprayLockPayload({ a: { x: 0, y: 1 }, z: 2 }),
    );
  });
});
