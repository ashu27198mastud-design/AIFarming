import { describe, expect, it } from 'vitest';
import { formatLocality, formatMarketName } from './locality';

describe('formatLocality', () => {
  it('uses Devanagari returned by the geocoder', () => {
    expect(formatLocality({ village: 'कांदिवली पश्चिम', district: 'Mumbai Suburban' }, 'mr')).toBe('कांदिवली पश्चिम');
  });

  it('transliterates known Latin locality and direction terms', () => {
    expect(formatLocality({ village: 'Borivali West', district: 'Mumbai Suburban' }, 'mr')).toBe('बोरीवली पश्चिम');
    expect(formatLocality({ village: 'R/C Ward', district: 'Mumbai' }, 'hi')).toBe('आर/सी वॉर्ड');
  });

  it('falls back upward without exposing unknown Latin text', () => {
    expect(formatLocality({ village: 'Unknown Hamlet', district: 'Mumbai Suburban' }, 'mr')).toBe('मुंबई उपनगर');
  });

  it('localizes the locality while preserving the APMC acronym', () => {
    expect(formatMarketName('Mumbai APMC', { district: 'Mumbai' }, 'mr')).toBe('मुंबई APMC');
  });
});
