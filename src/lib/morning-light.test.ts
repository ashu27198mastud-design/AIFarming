import { describe, expect, it } from 'vitest';
import {
  languageFromBrowser,
  languageFromLocation,
  WORDMARKS,
  wordmarkIndexForLanguage,
} from './morning-light';

describe('Morning Light language behavior', () => {
  it('ships the reviewed 23-script wordmark cycle', () => {
    expect(WORDMARKS).toHaveLength(23);
    expect(new Set(WORDMARKS.map((item) => item.code)).size).toBe(23);
  });

  it('maps Maharashtra and Goa to Marathi', () => {
    expect(languageFromLocation({ region: 'Maharashtra', country: 'India' })).toBe('mr');
    expect(languageFromLocation({ state: 'Goa', country: 'India' })).toBe('mr');
  });

  it('maps the rest of India to Hindi and other countries to English', () => {
    expect(languageFromLocation({ region: 'Punjab', country: 'India' })).toBe('hi');
    expect(languageFromLocation({ region: 'Kent', country: 'United Kingdom' })).toBe('en');
  });

  it('falls back through the browser language', () => {
    expect(languageFromBrowser('mr-IN')).toBe('mr');
    expect(languageFromBrowser('en-GB')).toBe('en');
    expect(languageFromBrowser('gu-IN')).toBe('hi');
  });

  it('freezes reduced motion on the active application language', () => {
    expect(WORDMARKS[wordmarkIndexForLanguage('mr')].code).toBe('mr');
    expect(WORDMARKS[wordmarkIndexForLanguage('en')].code).toBe('en');
  });
});
