export type EnamMarketLink = {
  state: string;
  district?: string;
  market?: string;
  commodity: string;
  stateId: number;
  apmcId: number;
  commodityId: string;
};

export type EnamMarketLinkInput = {
  state?: string;
  district?: string;
  market?: string;
  commodity?: string;
};

type RawLink = Partial<Record<keyof EnamMarketLink, unknown>>;

function cleanText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function positiveInteger(value: unknown): number | null {
  const parsed = typeof value === 'number' ? value : Number(cleanText(value));
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function normalize(value: unknown): string {
  return cleanText(value)
    .toLocaleLowerCase('en-IN')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toLink(value: unknown): EnamMarketLink | null {
  const row = value && typeof value === 'object' && !Array.isArray(value) ? value as RawLink : null;
  if (!row) return null;
  const state = cleanText(row.state);
  const commodity = cleanText(row.commodity);
  const stateId = positiveInteger(row.stateId);
  const apmcId = positiveInteger(row.apmcId);
  const commodityId = cleanText(row.commodityId);
  if (!state || !commodity || !stateId || !apmcId || !commodityId) return null;
  return {
    state,
    district: cleanText(row.district) || undefined,
    market: cleanText(row.market) || undefined,
    commodity,
    stateId,
    apmcId,
    commodityId,
  };
}

export function parseEnamMarketLinks(raw?: string | null): EnamMarketLink[] {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    const rows = Array.isArray(parsed) ? parsed : [parsed];
    return rows.map(toLink).filter((row): row is EnamMarketLink => row !== null);
  } catch {
    return [];
  }
}

function optionalMatch(linkValue: string | undefined, inputValue: string | undefined): boolean {
  if (!linkValue) return true;
  return normalize(linkValue) === normalize(inputValue);
}

export function resolveEnamMarketLink(input: EnamMarketLinkInput, links: EnamMarketLink[]): EnamMarketLink | null {
  const state = normalize(input.state);
  const commodity = normalize(input.commodity);
  if (!state || !commodity) return null;

  const candidates = links.filter((link) => normalize(link.state) === state && normalize(link.commodity) === commodity);
  const exact = candidates.find((link) => optionalMatch(link.district, input.district) && optionalMatch(link.market, input.market));
  if (exact) return exact;

  const districtOnly = candidates.find((link) => optionalMatch(link.district, input.district) && !link.market);
  if (districtOnly) return districtOnly;

  return candidates.find((link) => !link.district && !link.market) ?? null;
}