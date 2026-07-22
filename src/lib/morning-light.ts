import type { LanguageCode } from './i18n';

export type ApproximateLocation = {
  village?: string;
  district?: string;
  region?: string;
  state?: string;
  country?: string;
};

export type Wordmark = {
  code: string;
  label: string;
  caption: string;
  lang: string;
  dir?: 'ltr' | 'rtl';
};

export const WORDMARK_INTERVAL_MS = 2000;

export const WORDMARKS: readonly Wordmark[] = [
  { code: 'hi', label: 'किसानमित्र', caption: 'हिन्दी', lang: 'hi' },
  { code: 'bn', label: 'কিষাণমিত্র', caption: 'বাংলা', lang: 'bn' },
  { code: 'te', label: 'కిసాన్‌మిత్ర', caption: 'తెలుగు', lang: 'te' },
  { code: 'mr', label: 'किसानमित्र', caption: 'मराठी', lang: 'mr' },
  { code: 'ta', label: 'கிசான்மித்ரா', caption: 'தமிழ்', lang: 'ta' },
  { code: 'gu', label: 'કિસાનમિત્ર', caption: 'ગુજરાતી', lang: 'gu' },
  { code: 'kn', label: 'ಕಿಸಾನ್‌ಮಿತ್ರ', caption: 'ಕನ್ನಡ', lang: 'kn' },
  { code: 'ml', label: 'കിസാൻമിത്ര', caption: 'മലയാളം', lang: 'ml' },
  { code: 'or', label: 'କିଷାଣମିତ୍ର', caption: 'ଓଡ଼ିଆ', lang: 'or' },
  { code: 'pa', label: 'ਕਿਸਾਨਮਿੱਤਰ', caption: 'ਪੰਜਾਬੀ', lang: 'pa' },
  { code: 'as', label: 'কিষাণমিত্ৰ', caption: 'অসমীয়া', lang: 'as' },
  { code: 'mai', label: 'किसानमित्र', caption: 'मैथिली', lang: 'mai' },
  { code: 'sat', label: 'ᱠᱤᱥᱟᱱᱢᱤᱛᱨᱚ', caption: 'ᱥᱟᱱᱛᱟᱲᱤ', lang: 'sat' },
  { code: 'ks', label: 'کِسان مِتر', caption: 'کٲشُر', lang: 'ks', dir: 'rtl' },
  { code: 'ne', label: 'किसानमित्र', caption: 'नेपाली', lang: 'ne' },
  { code: 'sd', label: 'ڪسان متر', caption: 'سنڌي', lang: 'sd', dir: 'rtl' },
  { code: 'doi', label: 'किसानमित्र', caption: 'डोगरी', lang: 'doi' },
  { code: 'kok', label: 'किसानमित्र', caption: 'कोंकणी', lang: 'kok' },
  { code: 'mni', label: 'ꯀꯤꯁꯥꯟꯃꯤꯇ꯭ꯔ', caption: 'ꯃꯤꯇꯩ ꯂꯣꯟ', lang: 'mni' },
  { code: 'brx', label: 'किसानमित्र', caption: 'बड़ो', lang: 'brx' },
  { code: 'sa', label: 'कृषकमित्रम्', caption: 'संस्कृतम्', lang: 'sa' },
  { code: 'en', label: 'KisanMitra', caption: 'English', lang: 'en' },
];

const MARATHI_REGIONS = [
  'maharashtra',
  'goa',
  'mumbai',
  'pune',
  'nashik',
  'nagpur',
  'thane',
  'kolhapur',
  'borivali',
  'chhatrapati sambhajinagar',
];

export function languageFromLocation(location: ApproximateLocation): LanguageCode {
  const regionText = [location.state, location.region, location.district, location.village]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  const country = location.country?.toLowerCase() ?? '';

  if (MARATHI_REGIONS.some((term) => regionText.includes(term))) return 'mr';
  if (country.includes('india')) return 'hi';
  return 'en';
}

export function languageFromBrowser(browserLanguage?: string): LanguageCode {
  const normalized = browserLanguage?.toLowerCase() ?? '';
  if (normalized.startsWith('mr')) return 'mr';
  if (normalized.startsWith('en')) return 'en';
  return 'hi';
}

export function wordmarkIndexForLanguage(language: LanguageCode): number {
  const index = WORDMARKS.findIndex((item) => item.code === language);
  return index < 0 ? 0 : index;
}
