import type { LanguageCode } from './i18n';

export type GeoDisplayInput = {
  village?: string;
  suburb?: string;
  city?: string;
  district?: string;
  state?: string;
};

const LOCALITY_TERMS: Record<'hi' | 'mr', Record<string, string>> = {
  hi: {
    'r/c ward': 'आर/सी वॉर्ड',
    borivali: 'बोरीवली',
    kandivali: 'कांदिवली',
    mumbai: 'मुंबई',
    'mumbai suburban': 'मुंबई उपनगर',
    'mumbai suburban district': 'मुंबई उपनगर',
    nashik: 'नाशिक',
    pune: 'पुणे',
    nagpur: 'नागपुर',
    maharashtra: 'महाराष्ट्र',
    ward: 'वॉर्ड',
    sector: 'सेक्टर',
    east: 'पूर्व',
    west: 'पश्चिम',
    north: 'उत्तर',
    south: 'दक्षिण',
    suburban: 'उपनगर',
    district: 'जिला',
  },
  mr: {
    'r/c ward': 'आर/सी वॉर्ड',
    borivali: 'बोरीवली',
    kandivali: 'कांदिवली',
    mumbai: 'मुंबई',
    'mumbai suburban': 'मुंबई उपनगर',
    'mumbai suburban district': 'मुंबई उपनगर',
    nashik: 'नाशिक',
    pune: 'पुणे',
    nagpur: 'नागपूर',
    maharashtra: 'महाराष्ट्र',
    ward: 'वॉर्ड',
    sector: 'सेक्टर',
    east: 'पूर्व',
    west: 'पश्चिम',
    north: 'उत्तर',
    south: 'दक्षिण',
    suburban: 'उपनगर',
    district: 'जिल्हा',
  },
};

const DEVANAGARI = /[ऀ-ॿ]/;
const LATIN_WORD = /[A-Za-z]{3,}/;

function clean(value: string): string {
  return value.replace(/\s+/g, ' ').replace(/\s*,\s*/g, ', ').trim();
}

function isSafeDevanagari(value: string): boolean {
  return DEVANAGARI.test(value) && !LATIN_WORD.test(value.replace(/\bAPMC\b/g, ''));
}

function transliterateKnown(value: string, locale: 'hi' | 'mr'): string | null {
  const normalized = clean(value);
  const exact = LOCALITY_TERMS[locale][normalized.toLowerCase()];
  if (exact) return exact;

  const parts = normalized.split(/([\s,/-]+)/);
  const converted = parts.map((part) => {
    if (!/[A-Za-z]/.test(part)) return part;
    return LOCALITY_TERMS[locale][part.toLowerCase()] || part;
  }).join('');
  return LATIN_WORD.test(converted) ? null : clean(converted);
}

export function formatLocality(input: GeoDisplayInput, locale: LanguageCode): string {
  const candidates = [input.village, input.suburb, input.city, input.district, input.state]
    .map((value) => clean(value || ''))
    .filter(Boolean);

  if (locale === 'en') return candidates[0] || 'Local area';

  for (const candidate of candidates) {
    if (isSafeDevanagari(candidate)) return candidate;
    const transliterated = transliterateKnown(candidate, locale);
    if (transliterated) return transliterated;
  }

  return locale === 'mr' ? 'तुमचा परिसर' : 'आपका क्षेत्र';
}

export function formatMarketName(name: string, fallback: GeoDisplayInput, locale: LanguageCode): string {
  if (locale === 'en') return clean(name) || formatLocality(fallback, locale) + ' APMC';
  const marketLocality = clean(name).replace(/\bAPMC\b/gi, '').trim();
  const localized = formatLocality({ ...fallback, village: marketLocality }, locale);
  return localized + ' APMC';
}
