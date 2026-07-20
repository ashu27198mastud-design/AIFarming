import { NextRequest, NextResponse } from 'next/server';
import { calculateFertilizerGap } from '@/lib/fert-gap';
import type { LanguageCode } from '@/lib/i18n';

export const runtime = 'nodejs';

function optionalNumber(value: string | null): number | null {
  if (value === null || value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const requestedLanguage = params.get('language');
  const language: LanguageCode = requestedLanguage === 'mr' || requestedLanguage === 'hi' ? requestedLanguage : 'en';
  const crop = params.get('crop')?.trim() || (language === 'mr' ? 'टोमॅटो' : language === 'hi' ? 'टमाटर' : 'Tomato');
  const result = calculateFertilizerGap({
    crop,
    language,
    plannedBags: optionalNumber(params.get('plannedBags')),
    stockBags: optionalNumber(params.get('stockBags')),
  });
  return NextResponse.json(result, {
    headers: { 'Cache-Control': 'private, no-store' },
  });
}
