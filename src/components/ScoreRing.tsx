'use client';

import { useEffect, useRef, useState } from 'react';
import type { TranslationSet } from '@/lib/i18n';
import { clampScore, getScoreSemantic } from '@/lib/score-semantics';

type Props = {
  score: number | null;
  t: TranslationSet;
};

const RADIUS = 43;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ScoreRing({ score, t }: Props) {
  const normalized = score === null ? null : clampScore(score);
  const [drawnScore, setDrawnScore] = useState(0);
  const [duration, setDuration] = useState(800);
  const hasDrawn = useRef(false);

  useEffect(() => {
    if (normalized === null) {
      hasDrawn.current = false;
      const resetFrame = window.requestAnimationFrame(() => setDrawnScore(0));
      return () => window.cancelAnimationFrame(resetFrame);
    }

    setDuration(hasDrawn.current ? 400 : 800);
    let secondFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        setDrawnScore(normalized);
        hasDrawn.current = true;
      });
    });
    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [normalized]);

  if (normalized === null) {
    return (
      <div className="ops-readiness-ring score-ring score-ring-loading" aria-label={t.loading}>
        <svg viewBox="0 0 104 104" aria-hidden="true">
          <circle className="score-ring-track" cx="52" cy="52" r={RADIUS} />
          <circle className="score-ring-skeleton-arc" cx="52" cy="52" r={RADIUS} />
        </svg>
        <div className="score-ring-content"><span className="score-ring-skeleton-number" /></div>
      </div>
    );
  }

  const semantic = getScoreSemantic(normalized);
  const status = t[semantic.statusKey];
  const dashOffset = CIRCUMFERENCE * (1 - drawnScore / 100);

  return (
    <div className="ops-readiness-ring score-ring" style={{ color: semantic.color }} aria-label={normalized + ' ' + status}>
      <svg viewBox="0 0 104 104" aria-hidden="true">
        <circle className="score-ring-track" cx="52" cy="52" r={RADIUS} />
        <circle
          className="score-ring-value"
          cx="52"
          cy="52"
          r={RADIUS}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          style={{ stroke: semantic.color, transitionDuration: duration + 'ms' }}
        />
      </svg>
      <div className="score-ring-content">
        <strong>{normalized}</strong>
        <span>{status}</span>
      </div>
    </div>
  );
}
