import { describe, expect, it } from 'vitest';
import {
  PRODUCT_IDENTITY,
  canDisplayNumericClaim,
  findAgriculturalRecommendationIssues,
  isCommercialPlacementDisclosed,
  requiresExpertEscalation,
  resolveInitialLanguage,
  shouldRequestGeolocation,
} from './product-policy';

describe('ANVAYA product identity', () => {
  it('keeps farmer platform access free and KisanMitra as the assistant', () => {
    expect(PRODUCT_IDENTITY).toEqual({
      brand: 'ANVAYA',
      descriptor: 'Agriculture OS',
      assistant: 'KisanMitra AI',
      farmerAccessFeeInr: 0,
    });
  });
});

describe('language preference policy', () => {
  it('gives a confirmed manual language priority over profile and browser', () => {
    expect(resolveInitialLanguage({ manual: 'mr', profile: 'hi', browser: 'en-IN' })).toBe('mr');
  });

  it('uses profile before browser and English for an unsupported language', () => {
    expect(resolveInitialLanguage({ profile: 'hi', browser: 'mr-IN' })).toBe('hi');
    expect(resolveInitialLanguage({ browser: 'ta-IN' })).toBe('en');
  });
});

describe('location consent policy', () => {
  it('requests geolocation only after the explicit use-location action', () => {
    expect(shouldRequestGeolocation(null)).toBe(false);
    expect(shouldRequestGeolocation('choose-manually')).toBe(false);
    expect(shouldRequestGeolocation('not-now')).toBe(false);
    expect(shouldRequestGeolocation('use-location')).toBe(true);
  });
});

describe('agricultural safety policy', () => {
  it('escalates uncertain and severe diagnoses', () => {
    expect(requiresExpertEscalation(59, 'low')).toBe(true);
    expect(requiresExpertEscalation(90, 'high')).toBe(true);
    expect(requiresExpertEscalation(90, 'critical')).toBe(true);
    expect(requiresExpertEscalation(90, 'unknown')).toBe(true);
    expect(requiresExpertEscalation(80, 'medium')).toBe(false);
  });

  it('detects dosage and guarantee language in treatment recommendations', () => {
    expect(findAgriculturalRecommendationIssues('Apply 20 ml before sunset.')).toContain('dosage');
    expect(findAgriculturalRecommendationIssues('This guarantees success.')).toContain('guarantee');
    expect(findAgriculturalRecommendationIssues('Consult a licensed expert and follow the approved label.')).toEqual([]);
  });
});

describe('commercial trust policy', () => {
  it('requires evidence for numeric claims', () => {
    expect(canDisplayNumericClaim('none')).toBe(false);
    expect(canDisplayNumericClaim('verified-config')).toBe(true);
    expect(canDisplayNumericClaim('illustrative-demo')).toBe(true);
  });

  it('requires a disclosure for commercial placements', () => {
    expect(isCommercialPlacementDisclosed({
      partnerOffer: false,
      sponsoredPlacement: false,
      referralRelationship: false,
      disclosureShown: false,
    })).toBe(true);

    expect(isCommercialPlacementDisclosed({
      partnerOffer: true,
      sponsoredPlacement: false,
      referralRelationship: true,
      serviceChargeInr: 120,
      disclosureShown: false,
    })).toBe(false);
  });
});
