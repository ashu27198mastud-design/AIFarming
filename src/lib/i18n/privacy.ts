import type { LanguageCode } from '../i18n';
import { enPrivacy } from './en';
import { hiPrivacy } from './hi';
import { mrPrivacy } from './mr';
import type { PrivacyCopy } from './privacy-types';

export const PRIVACY_COPY: Record<LanguageCode, PrivacyCopy> = {
  en: enPrivacy,
  hi: hiPrivacy,
  mr: mrPrivacy,
};
