import { describe, expect, it } from 'vitest';
import { clampScore, getScoreSemantic } from './score-semantics';

describe('score semantics', () => {
  it.each([
    [0, 'danger'],
    [40, 'danger'],
    [41, 'warn'],
    [70, 'warn'],
    [71, 'ok'],
    [100, 'ok'],
  ])('maps %s to %s', (score, tone) => {
    expect(getScoreSemantic(score).tone).toBe(tone);
  });

  it('clamps invalid and out-of-range values', () => {
    expect(clampScore(-5)).toBe(0);
    expect(clampScore(105)).toBe(100);
    expect(clampScore(Number.NaN)).toBe(0);
  });
});
