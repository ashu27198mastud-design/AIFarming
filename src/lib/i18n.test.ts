import { describe, expect, it } from 'vitest';
import { TRANSLATIONS } from './i18n';

describe('mandi source copy', () => {
  it('keeps fallback messaging farmer-facing and free of implementation details', () => {
    for (const copy of Object.values(TRANSLATIONS)) {
      expect(copy.liveMarketKeyMissing).not.toMatch(/DATA_GOV_API_KEY|API key|environment|fallback/i);
      expect(copy.fallbackSource).not.toMatch(/DATA_GOV_API_KEY|API key|environment|fallback/i);
    }
  });
});