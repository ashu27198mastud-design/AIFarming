import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get('lat'));
  const lng = Number(searchParams.get('lng'));
  const fallback = searchParams.get('fallback') || 'Location unavailable';
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ village: fallback, district: fallback, state: '', source: 'fallback' }, { status: 400 });
  }

  try {
    const url = new URL('https://nominatim.openstreetmap.org/reverse');
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('lat', String(lat));
    url.searchParams.set('lon', String(lng));
    url.searchParams.set('zoom', '14');
    url.searchParams.set('addressdetails', '1');
    const response = await fetch(url, {
      headers: { 'User-Agent': 'KisanMitra-Farm-Assistant/1.0' },
      next: { revalidate: 86400 },
    });
    if (!response.ok) throw new Error(`Reverse geocoding returned ${response.status}`);
    const payload = await response.json();
    const address = payload.address || {};
    const village = address.village || address.hamlet || address.town || address.city || address.suburb || fallback;
    const district = address.state_district || address.county || fallback;
    return NextResponse.json({
      village,
      district,
      state: address.state || '',
      displayName: payload.display_name || village,
      source: 'openstreetmap',
    }, { headers: { 'Cache-Control': 's-maxage=86400, stale-while-revalidate=604800' } });
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return NextResponse.json({ village: fallback, district: fallback, state: '', source: 'fallback' });
  }
}
