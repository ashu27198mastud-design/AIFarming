import { NextRequest, NextResponse } from 'next/server';
import { fetchWeatherForecast } from '@/lib/weather';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') ?? '20.014');
  const lng = parseFloat(searchParams.get('lng') ?? '73.785');

  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
  }

  const forecast = await fetchWeatherForecast(lat, lng);
  return NextResponse.json(forecast, {
    headers: { 'Cache-Control': 's-maxage=1800, stale-while-revalidate=3600' },
  });
}
