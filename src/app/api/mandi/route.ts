import { NextRequest, NextResponse } from 'next/server';
import fallbackPrices from '@/data/mandi-fallback.json';

export const runtime = 'nodejs';

const RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';

type RawRecord = Record<string, string | number | null | undefined>;

type MandiRecord = {
  commodity: string;
  market: string;
  district: string;
  state: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  arrivalDate: string;
};

function pick(record: RawRecord, ...keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null && String(value).trim()) return String(value).trim();
  }
  return '';
}

function toNumber(value: string): number {
  const parsed = Number(value.replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalize(record: RawRecord): MandiRecord {
  return {
    commodity: pick(record, 'commodity', 'Commodity'),
    market: pick(record, 'market', 'Market'),
    district: pick(record, 'district', 'District'),
    state: pick(record, 'state', 'State'),
    minPrice: toNumber(pick(record, 'min_price', 'Min Price', 'minPrice')),
    maxPrice: toNumber(pick(record, 'max_price', 'Max Price', 'maxPrice')),
    modalPrice: toNumber(pick(record, 'modal_price', 'Modal Price', 'modalPrice')),
    arrivalDate: pick(record, 'arrival_date', 'Arrival_Date', 'Arrival Date', 'arrivalDate'),
  };
}

function deriveTrend(records: MandiRecord[]): { direction: 'rising' | 'falling' | 'stable'; percent: number } {
  const valid = records.filter((record) => record.modalPrice > 0);
  if (valid.length < 2) return { direction: 'stable', percent: 0 };

  const sorted = [...valid].sort((a, b) => new Date(a.arrivalDate).getTime() - new Date(b.arrivalDate).getTime());
  const first = sorted[0].modalPrice;
  const last = sorted[sorted.length - 1].modalPrice;
  if (!first) return { direction: 'stable', percent: 0 };

  const percent = Math.round(((last - first) / first) * 1000) / 10;
  return {
    direction: percent > 1 ? 'rising' : percent < -1 ? 'falling' : 'stable',
    percent,
  };
}

function fallbackFor(commodity: string): MandiRecord[] {
  const normalized = commodity.toLowerCase();
  const records = (fallbackPrices as MandiRecord[]).filter((record) => record.commodity.toLowerCase() === normalized);
  return records.length ? records : (fallbackPrices as MandiRecord[]).slice(0, 1);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get('state')?.trim() || 'Maharashtra';
  const district = searchParams.get('district')?.trim() || 'Nashik';
  const commodity = searchParams.get('commodity')?.trim() || 'Tomato';
  const market = searchParams.get('market')?.trim() || '';
  const variety = searchParams.get('variety')?.trim() || '';
  const grade = searchParams.get('grade')?.trim() || '';
  const offset = Math.max(0, Number.parseInt(searchParams.get('offset') || '0', 10) || 0);
  const requestedLimit = Number.parseInt(searchParams.get('limit') || '10', 10) || 10;
  const limit = Math.min(10, Math.max(1, requestedLimit));
  const apiKey = process.env.DATA_GOV_API_KEY;

  if (!apiKey) {
    const records = fallbackFor(commodity);
    return NextResponse.json(
      { records, trend: deriveTrend(records), dataSource: 'fallback', fetchedAt: new Date().toISOString() },
      { headers: { 'Cache-Control': 's-maxage=21600, stale-while-revalidate=86400' } },
    );
  }

  try {
    const url = new URL(`https://api.data.gov.in/resource/${RESOURCE_ID}`);
    url.searchParams.set('api-key', apiKey);
    url.searchParams.set('format', 'json');
    url.searchParams.set('offset', String(offset));
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('filters[state.keyword]', state);
    url.searchParams.set('filters[district]', district);
    url.searchParams.set('filters[commodity]', commodity);
    if (market) url.searchParams.set('filters[market]', market);
    if (variety) url.searchParams.set('filters[variety]', variety);
    if (grade) url.searchParams.set('filters[grade]', grade);

    const response = await fetch(url.toString(), { next: { revalidate: 21600 } });
    if (!response.ok) throw new Error(`Agmarknet returned ${response.status}`);

    const payload = await response.json();
    const records = Array.isArray(payload.records) ? payload.records.map(normalize).filter((record: MandiRecord) => record.modalPrice > 0) : [];
    if (!records.length) throw new Error('No matching mandi records');

    return NextResponse.json(
      { records, trend: deriveTrend(records), dataSource: 'live', fetchedAt: new Date().toISOString() },
      { headers: { 'Cache-Control': 's-maxage=21600, stale-while-revalidate=86400' } },
    );
  } catch (error) {
    console.error('Mandi API error:', error);
    const records = fallbackFor(commodity);
    return NextResponse.json(
      { records, trend: deriveTrend(records), dataSource: 'fallback', fetchedAt: new Date().toISOString() },
      { headers: { 'Cache-Control': 's-maxage=21600, stale-while-revalidate=86400' } },
    );
  }
}
