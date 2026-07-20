import { describe, expect, it } from 'vitest';
import { parseEnamMarketLinks, resolveEnamMarketLink } from './enam-market-links';

describe('eNAM market links', () => {
  const raw = JSON.stringify([
    {
      state: 'Maharashtra',
      district: 'Nashik',
      market: 'Nashik APMC',
      commodity: 'Tomato',
      stateId: 27,
      apmcId: 501,
      commodityId: 'tomato-id',
    },
    {
      state: 'Maharashtra',
      district: 'Nashik',
      commodity: 'Onion',
      stateId: 27,
      apmcId: 502,
      commodityId: 'onion-id',
    },
  ]);

  it('parses only complete configured links', () => {
    expect(parseEnamMarketLinks(raw)).toHaveLength(2);
    expect(parseEnamMarketLinks('{bad json')).toEqual([]);
    expect(parseEnamMarketLinks(JSON.stringify([{ state: 'Maharashtra' }]))).toEqual([]);
  });

  it('resolves an exact market and crop match', () => {
    expect(resolveEnamMarketLink({ state: 'maharashtra', district: 'Nashik', market: 'Nashik APMC', commodity: 'Tomato' }, parseEnamMarketLinks(raw))).toMatchObject({
      stateId: 27,
      apmcId: 501,
      commodityId: 'tomato-id',
    });
  });

  it('falls back to district-level mapping when market is not specified', () => {
    expect(resolveEnamMarketLink({ state: 'Maharashtra', district: 'Nashik', market: 'Lasalgaon APMC', commodity: 'Onion' }, parseEnamMarketLinks(raw))).toMatchObject({
      apmcId: 502,
      commodityId: 'onion-id',
    });
  });

  it('does not guess IDs for unmapped crops', () => {
    expect(resolveEnamMarketLink({ state: 'Maharashtra', district: 'Nashik', commodity: 'Cotton' }, parseEnamMarketLinks(raw))).toBeNull();
  });
});