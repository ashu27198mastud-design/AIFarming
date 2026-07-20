import { NextRequest, NextResponse } from 'next/server';
import {
  getAllBids,
  isUmangEnamConfigured,
  summarizeBids,
  UmangGatewayError,
  type EnamBidSummary,
} from '@/lib/umang-enam';

export const runtime = 'nodejs';

type BidLookup = {
  language: string;
  stateId: number;
  apmcId: number;
  commodityId: string;
};

const EMPTY_SUMMARY: EnamBidSummary = {
  lots: 0,
  openLots: 0,
  highestBid: 0,
  totalWeightQuintal: 0,
  rateUom: 'QUINTAL',
  closesAt: '',
};

function numberParam(value: string | null): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function readBidLookup(params: URLSearchParams): BidLookup | null {
  const language = params.get('language')?.trim() || 'en';
  const stateId = numberParam(params.get('stateId')) ?? numberParam(process.env.UMANG_ENAM_STATE_ID ?? null);
  const apmcId = numberParam(params.get('apmcId')) ?? numberParam(process.env.UMANG_ENAM_APMC_ID ?? null);
  const commodityId = params.get('commodityId')?.trim() || process.env.UMANG_ENAM_COMMODITY_ID?.trim() || '';
  if (!stateId || !apmcId || !commodityId) return null;
  return { language, stateId, apmcId, commodityId };
}

function unavailable(reason: string) {
  return NextResponse.json(
    {
      bids: [],
      summary: EMPTY_SUMMARY,
      dataSource: 'unavailable',
      reason,
      fetchedAt: new Date().toISOString(),
    },
    { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=900' } },
  );
}

export async function GET(request: NextRequest) {
  const lookup = readBidLookup(request.nextUrl.searchParams);
  if (!lookup) return unavailable('market_not_linked');

  if (!isUmangEnamConfigured()) return unavailable('gateway_not_configured');

  try {
    const bids = await getAllBids(lookup);
    return NextResponse.json(
      {
        bids,
        summary: summarizeBids(bids),
        dataSource: 'live',
        fetchedAt: new Date().toISOString(),
      },
      { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=900' } },
    );
  } catch (error) {
    const status = error instanceof UmangGatewayError ? error.status : 502;
    console.error('UMANG/eNAM bid lookup failed:', error);
    return unavailable(status === 401 || status === 403 ? 'gateway_forbidden' : 'gateway_unavailable');
  }
}
