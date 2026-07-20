export type ScoreTone = 'danger' | 'warn' | 'ok';

export type ScoreSemantic = {
  tone: ScoreTone;
  color: 'var(--danger)' | 'var(--warn)' | 'var(--ok)';
  statusKey: 'scoreDanger' | 'scoreWarning' | 'scoreGood';
};

export function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function getScoreSemantic(value: number): ScoreSemantic {
  const score = clampScore(value);
  if (score <= 40) {
    return { tone: 'danger', color: 'var(--danger)', statusKey: 'scoreDanger' };
  }
  if (score <= 70) {
    return { tone: 'warn', color: 'var(--warn)', statusKey: 'scoreWarning' };
  }
  return { tone: 'ok', color: 'var(--ok)', statusKey: 'scoreGood' };
}
