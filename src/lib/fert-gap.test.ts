import { describe, expect, it } from 'vitest';
import { calculateFertilizerGap } from './fert-gap';

describe('calculateFertilizerGap', () => {
  it('returns an honest empty state without logged inventory', () => {
    expect(calculateFertilizerGap({ crop: 'टोमॅटो', language: 'mr', plannedBags: null, stockBags: null })).toEqual({ status: 'empty' });
  });

  it('calculates only the gap between a logged plan and stock', () => {
    const result = calculateFertilizerGap({ crop: 'टोमॅटो', language: 'mr', plannedBags: 5, stockBags: 3 });
    expect(result.status).toBe('ready');
    if (result.status === 'ready') {
      expect(result.quantity).toBe(2);
      expect(result.verdict).toBe('टोमॅटोसाठी २ बॅग युरिया लागेल');
      expect(result.categoryPath).toBe('/bazaar?category=urea&lang=mr');
    }
  });

  it('never returns a negative purchase gap', () => {
    const result = calculateFertilizerGap({ crop: 'Tomato', language: 'en', plannedBags: 2, stockBags: 4 });
    expect(result.status === 'ready' && result.quantity).toBe(0);
  });
});
