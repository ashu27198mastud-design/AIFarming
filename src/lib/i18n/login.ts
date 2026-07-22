import type { LanguageCode } from '../i18n';
import { enLogin } from './en';
import { hiLogin } from './hi';
import type { LoginCopy } from './login-types';
import { mrLogin } from './mr';

export const LOGIN_COPY: Record<LanguageCode, LoginCopy> = {
  en: enLogin,
  hi: hiLogin,
  mr: mrLogin,
};

export const LOGIN_LANGUAGES: ReadonlyArray<{ code: LanguageCode; label: string }> = [
  { code: 'mr', label: 'मराठी' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'en', label: 'English' },
];
