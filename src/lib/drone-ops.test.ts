import { describe, expect, it } from 'vitest';
import { evaluateDronePreflight, type DronePreflightInput } from './drone-ops';

const NOW = new Date('2026-07-22T07:30:00.000Z');

function makeInput(overrides?: Partial<DronePreflightInput>): DronePreflightInput {
  return {
    farmId: 'farm-asha-001',
    fieldId: 'field-north',
    routeChecksum: 'a4f6e8120c449e72',
    missionType: 'inspection',
    operatorVerified: false,
    telemetry: {
      deviceId: 'ANV-DR-0102',
      sequence: 102,
      capturedAt: '2026-07-22T07:29:40.000Z',
      source: 'device',
      batteryPercent: 84,
      gpsAccuracyM: 1.8,
      satelliteCount: 14,
      linkQualityPercent: 88,
      motorHealthPercent: 96,
      storageAvailablePercent: 62,
      calibrationAgeDays: 8,
      homePointSet: true,
      returnPathClear: true,
      withinApprovedGeofence: true,
      firmwareVersion: '0.2.0',
      attestation: { keyId: 'drone-key-0102' },
    },
    weather: {
      capturedAt: '2026-07-22T07:25:00.000Z',
      source: 'live',
      windSpeedKmh: 12,
      precipitationProbability: 10,
    },
    ...overrides,
  };
}

describe('evaluateDronePreflight', () => {
  it('releases the launch lock for a healthy inspection mission', () => {
    const result = evaluateDronePreflight(makeInput(), NOW);
    expect(result.decision).toBe('ready');
    expect(result.launchLockEngaged).toBe(false);
  });

  it('blocks launch outside the approved geofence', () => {
    const input = makeInput();
    input.telemetry.withinApprovedGeofence = false;
    const result = evaluateDronePreflight(input, NOW);
    expect(result.decision).toBe('blocked');
    expect(result.reasonCodes).toContain('outside_geofence');
  });

  it('blocks launch when wind and battery cannot support a safe return', () => {
    const input = makeInput();
    input.telemetry.batteryPercent = 22;
    input.weather.windSpeedKmh = 34;
    const result = evaluateDronePreflight(input, NOW);
    expect(result.decision).toBe('blocked');
    expect(result.reasonCodes).toEqual(expect.arrayContaining(['battery_reserve_low', 'wind_high']));
  });

  it('requires operator verification for a spraying mission', () => {
    const result = evaluateDronePreflight(makeInput({ missionType: 'spraying' }), NOW);
    expect(result.decision).toBe('blocked');
    expect(result.reasonCodes).toContain('operator_required');
  });

  it('requires inspection for weak link quality without pretending launch is safe', () => {
    const input = makeInput();
    input.telemetry.linkQualityPercent = 40;
    const result = evaluateDronePreflight(input, NOW);
    expect(result.decision).toBe('inspect');
    expect(result.launchLockEngaged).toBe(true);
  });
});
