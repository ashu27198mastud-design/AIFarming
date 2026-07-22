import type { LanguageCode } from './i18n';

export const LANGUAGE_COOKIE_KEY = 'km_lang';
export const LANGUAGE_MANUAL_COOKIE_KEY = 'km_lang_manual';
export const SUPPORTED_LANGUAGE_CODES = ['mr', 'hi', 'en'] as const;

export function isLanguageCode(value: string | null | undefined): value is LanguageCode {
  return SUPPORTED_LANGUAGE_CODES.some((language) => language === value);
}
