import { NextRequest, NextResponse } from 'next/server';
import {
  getApmcsForDistrict,
  getMandiInformation,
  isUmangEnamConfigured,
  UmangGatewayError,
} from '@/lib/umang-enam';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const state = params.get('state')?.trim() || '';
  const district = params.get('district')?.trim() || '';
  const language = params.get('language')?.trim() || 'en';
  const mandi = params.get('mandi')?.trim() || '';

  if (!state || !district) {
    return NextResponse.json({ error: 'state and district are required' }, { status: 400 });
  }

  if (!isUmangEnamConfigured()) {
    return NextResponse.json({ apmcs: [], details: [], dataSource: 'fallback', reason: 'gateway_not_configured' });
  }

  try {
    if (mandi) {
      const details = await getMandiInformation({ language, state, district, mandi });
      return NextResponse.json({ apmcs: [], details, dataSource: 'live' });
    }
    const apmcs = await getApmcsForDistrict({ language, state, district });
    return NextResponse.json({ apmcs, details: [], dataSource: 'live' });
  } catch (error) {
    const status = error instanceof UmangGatewayError ? error.status : 502;
    console.error('UMANG/eNAM APMC lookup failed:', error);
    return NextResponse.json({
      apmcs: [],
      details: [],
      dataSource: 'fallback',
      reason: status === 401 || status === 403 ? 'gateway_forbidden' : 'gateway_unavailable',
    });
  }
}
