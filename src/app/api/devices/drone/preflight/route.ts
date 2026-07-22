import { createHash, createHmac, createPublicKey, randomUUID, verify } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import {
  canonicalizeDronePayload,
  dronePreflightSchema,
  droneSignaturePayload,
  evaluateDronePreflight,
  type DroneTelemetryInput,
} from '@/lib/drone-ops';

export const runtime = 'nodejs';

type AttestationStatus = 'verified' | 'unverified' | 'demo';

function configuredDevicePublicKey(deviceId: string): string | null {
  const raw = process.env.DRONE_DEVICE_PUBLIC_KEYS_JSON;
  if (!raw) return null;
  try {
    const keys = JSON.parse(raw) as Record<string, string>;
    return keys[deviceId] || null;
  } catch {
    return null;
  }
}

function verifyDeviceAttestation(telemetry: DroneTelemetryInput): AttestationStatus {
  if (telemetry.source === 'simulated') return 'demo';
  const publicKeyPem = configuredDevicePublicKey(telemetry.deviceId);
  const signature = telemetry.attestation.signature;
  if (!publicKeyPem || !signature) return 'unverified';
  try {
    return verify(
      null,
      Buffer.from(droneSignaturePayload(telemetry)),
      createPublicKey(publicKeyPem),
      Buffer.from(signature, 'base64'),
    ) ? 'verified' : 'unverified';
  } catch {
    return 'unverified';
  }
}

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);
  const parsed = dronePreflightSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid drone preflight payload', issues: parsed.error.flatten() },
      { status: 400, headers: { 'Cache-Control': 'private, no-store' } },
    );
  }

  const verifiedAt = new Date().toISOString();
  const evaluation = evaluateDronePreflight(parsed.data, new Date(verifiedAt));
  const sourceAttestation = verifyDeviceAttestation(parsed.data.telemetry);
  const record = {
    recordId: randomUUID(),
    verifiedAt,
    farmId: parsed.data.farmId,
    fieldId: parsed.data.fieldId,
    deviceId: parsed.data.telemetry.deviceId,
    sequence: parsed.data.telemetry.sequence,
    missionType: parsed.data.missionType,
    routeChecksum: parsed.data.routeChecksum,
    sourceAttestation,
    evaluation,
    telemetry: parsed.data.telemetry,
    weather: parsed.data.weather,
  };
  const canonicalRecord = canonicalizeDronePayload(record);
  const signingKey = process.env.DRONE_RECORD_SIGNING_KEY;
  const evidenceHash = signingKey
    ? createHmac('sha256', signingKey).update(canonicalRecord).digest('hex')
    : createHash('sha256').update(canonicalRecord).digest('hex');

  return NextResponse.json(
    { ...record, evidenceHash, recordSealMode: signingKey ? 'server-hmac-sha256' : 'demo-digest-only' },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}
