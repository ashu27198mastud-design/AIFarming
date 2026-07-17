export const PRODUCT_IDENTITY = {
  brand: 'ANVAYA',
  descriptor: 'Agriculture OS',
  assistant: 'KisanMitra AI',
  farmerAccessFeeInr: 0,
} as const;

export type PhaseOneLanguageCode = 'en' | 'hi' | 'mr';

type LanguagePreferenceInput = {
  manual?: string | null;
  profile?: string | null;
  browser?: string | null;
};

const PHASE_ONE_LANGUAGES = new Set<PhaseOneLanguageCode>(['en', 'hi', 'mr']);

function supportedLanguage(value?: string | null): PhaseOneLanguageCode | null {
  if (!value) return null;
  const base = value.trim().toLowerCase().split('-')[0] as PhaseOneLanguageCode;
  return PHASE_ONE_LANGUAGES.has(base) ? base : null;
}

export function resolveInitialLanguage(input: LanguagePreferenceInput): PhaseOneLanguageCode {
  return supportedLanguage(input.manual)
    ?? supportedLanguage(input.profile)
    ?? supportedLanguage(input.browser)
    ?? 'en';
}

export type LocationPromptAction = 'use-location' | 'choose-manually' | 'not-now' | null;

export function shouldRequestGeolocation(action: LocationPromptAction): boolean {
  return action === 'use-location';
}

export type DiagnosisSeverity = 'healthy' | 'low' | 'medium' | 'high' | 'critical' | 'unknown';

export function requiresExpertEscalation(confidence: number, severity: DiagnosisSeverity): boolean {
  return confidence < 60 || severity === 'high' || severity === 'critical' || severity === 'unknown';
}

export type ClaimEvidence = 'verified-config' | 'illustrative-demo' | 'none';

export function canDisplayNumericClaim(evidence: ClaimEvidence): boolean {
  return evidence === 'verified-config' || evidence === 'illustrative-demo';
}

export type CommercialDisclosure = {
  partnerOffer: boolean;
  sponsoredPlacement: boolean;
  referralRelationship: boolean;
  serviceChargeInr?: number;
  disclosureShown: boolean;
};

export function isCommercialPlacementDisclosed(placement: CommercialDisclosure): boolean {
  const isCommercial = placement.partnerOffer
    || placement.sponsoredPlacement
    || placement.referralRelationship
    || typeof placement.serviceChargeInr === 'number';

  return !isCommercial || placement.disclosureShown;
}

const TREATMENT_DOSAGE_PATTERN = /\b\d+(?:\.\d+)?\s*(?:ml|millilitres?|milliliters?|g|grams?|kg|kilograms?|litres?|liters?|l)\b/i;
const GUARANTEE_PATTERN = /\b(?:guarantee(?:d|s)?|100%\s+(?:accurate|approval|success)|will\s+definitely)\b/i;

export type AgriculturalRecommendationIssue = 'dosage' | 'guarantee';

export function findAgriculturalRecommendationIssues(text: string): AgriculturalRecommendationIssue[] {
  const issues: AgriculturalRecommendationIssue[] = [];
  if (TREATMENT_DOSAGE_PATTERN.test(text)) issues.push('dosage');
  if (GUARANTEE_PATTERN.test(text)) issues.push('guarantee');
  return issues;
}
