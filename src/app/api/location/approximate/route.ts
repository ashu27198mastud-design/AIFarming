import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type IpLocationPayload = {
  city?: string;
  region?: string;
  country_name?: string;
  latitude?: number;
  longitude?: number;
  error?: boolean;
  reason?: string;
};

function readForwardedIp(request: NextRequest): string | null {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (!forwarded || !/^[0-9a-f:.]+$/i.test(forwarded)) return null;
  if (forwarded === '::1' || forwarded.startsWith('127.') || forwarded.startsWith('10.') || forwarded.startsWith('192.168.')) return null;
  return forwarded;
}

export async function GET(request: NextRequest) {
  try {
    const forwardedIp = readForwardedIp(request);
    const endpoint = forwardedIp
      ? `https://ipapi.co/${encodeURIComponent(forwardedIp)}/json/`
      : 'https://ipapi.co/json/';
    const response = await fetch(endpoint, {
      cache: 'no-store',
      headers: { 'User-Agent': 'ANVAYA-Agriculture-OS/1.0' },
    });

    if (!response.ok) throw new Error(`IP location returned ${response.status}`);

    const payload = await response.json() as IpLocationPayload;
    const lat = Number(payload.latitude);
    const lng = Number(payload.longitude);
    if (payload.error || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw new Error(payload.reason || 'IP location did not return coordinates');
    }

    const village = payload.city || payload.region || payload.country_name || '';
    return NextResponse.json({
      lat,
      lng,
      village,
      district: payload.region || village,
      country: payload.country_name || '',
      source: 'ip-approximate',
    });
  } catch (error) {
    console.error('Approximate location failed:', error);
    return NextResponse.json({ error: 'Approximate location unavailable' }, { status: 503 });
  }
}
