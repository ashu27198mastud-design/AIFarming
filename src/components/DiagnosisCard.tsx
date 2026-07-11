'use client';

import { useMemo, useState } from 'react';
import { AlertCircle, Clock, Volume2, VolumeX } from 'lucide-react';
import type { TranslationSet } from '@/lib/i18n';
import type { HourlyWeather } from '@/types';

export type DiagnosisView = {
  mostLikelyIssue: string;
  alternativePossibilities: string[];
  confidence: number;
  visibleIndicators: string[];
  severity: string;
  urgency: string;
  questionsForAccuracy: string[];
  immediateAction: string;
  organicOptions: string[];
  chemicalCategory: string;
  preventionAdvice: string;
  followUpDays: number;
  requiresExpert: boolean;
  imageQuality?: string;
  imageCategory?: string;
  dataSource?: string;
  disclaimer?: string;
};

type Props = {
  diagnosis: DiagnosisView;
  t: TranslationSet;
  lang: string;
  hourlyWeather: HourlyWeather[];
};

function formatHour(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }).format(date);
}

function findSprayWindow(hourly: HourlyWeather[]): string {
  const now = Date.now();
  const safe = hourly.filter((item) => {
    const date = new Date(item.time);
    const hour = date.getHours();
    return date.getTime() >= now && hour >= 6 && hour <= 18 && item.precipProbability < 25 && item.precipMm <= 0.2 && item.windSpeedKmh < 20;
  });

  for (let start = 0; start <= safe.length - 6; start += 1) {
    const sequence = safe.slice(start, start + 6);
    const continuous = sequence.every((item, index) => index === 0 || new Date(item.time).getTime() - new Date(sequence[index - 1].time).getTime() <= 75 * 60 * 1000);
    if (continuous) {
      const from = new Date(sequence[0].time);
      const to = new Date(sequence[5].time);
      to.setHours(to.getHours() + 1);
      return `${from.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}, ${formatHour(from)}–${formatHour(to)} · dry, daylight, low wind`;
    }
  }

  return 'No safe 6-hour daylight spray window found in the latest forecast. Review again later.';
}

export default function DiagnosisCard({ diagnosis, t, lang, hourlyWeather }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const isLive = diagnosis.dataSource === 'live';
  const sprayWindow = useMemo(() => findSprayWindow(hourlyWeather), [hourlyWeather]);

  const healthStyle = diagnosis.severity === 'critical' || diagnosis.severity === 'high'
    ? 'border-rose-200 bg-rose-50 text-rose-700'
    : diagnosis.severity === 'medium'
      ? 'border-amber-200 bg-amber-50 text-amber-700'
      : diagnosis.severity === 'unknown'
        ? 'border-zinc-200 bg-zinc-100 text-zinc-700'
        : 'border-emerald-200 bg-emerald-50 text-emerald-700';

  const healthLabel = diagnosis.severity === 'critical' || diagnosis.severity === 'high'
    ? t.diseased
    : diagnosis.severity === 'medium'
      ? t.alert
      : diagnosis.severity === 'unknown'
        ? t.unavailable
        : t.healthy;

  const speak = () => {
    if (!window.speechSynthesis) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(`${diagnosis.mostLikelyIssue}. ${diagnosis.immediateAction}. ${sprayWindow}`);
    utterance.lang = lang === 'mr' ? 'mr-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-4 border-t border-zinc-100 pt-4">
      {!isLive && (
        <div className="sticky top-16 z-20 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-black text-amber-900 shadow-sm">
          {t.demoBanner}
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-bold ${healthStyle}`}>{healthLabel}</span>
        <button type="button" onClick={speak} className="flex min-h-12 min-w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-700" aria-label={speaking ? t.stopSpeech : t.readAloud}>
          {speaking ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
      </div>

      <div>
        <h3 className="mb-1 text-lg font-black text-zinc-800">{diagnosis.mostLikelyIssue}</h3>
        {isLive && (
          <div className="flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100">
              <div className="h-full rounded-full bg-[#2E7D32]" style={{ width: `${Math.max(0, Math.min(100, diagnosis.confidence))}%` }} />
            </div>
            <span className="text-xs font-mono font-bold text-[#2E7D32]">{diagnosis.confidence}%</span>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-3.5">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-zinc-500">
          <AlertCircle className="h-4 w-4 text-[#2E7D32]" /> {t.whatToDo}
        </div>
        <ul className="space-y-2 text-sm font-semibold leading-relaxed text-zinc-700">
          {(diagnosis.immediateAction || '').split('\n').filter(Boolean).slice(0, 3).map((step, index) => (
            <li key={`${step}-${index}`} className="flex items-start gap-2"><span className="font-extrabold text-[#2E7D32]">•</span><span>{step}</span></li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-[#2E7D32]/10 bg-emerald-50/50 p-3">
          <span className="mb-1 block text-[11px] font-black tracking-wider text-emerald-800">{t.organicOption}</span>
          {diagnosis.organicOptions?.length ? diagnosis.organicOptions.map((option) => <div key={option} className="text-sm font-bold text-[#2E7D32]">{option}</div>) : <div className="text-sm font-semibold text-zinc-500">—</div>}
        </div>
        <div className="rounded-2xl border border-[#C62828]/10 bg-rose-50/50 p-3">
          <span className="mb-1 block text-[11px] font-black tracking-wider text-rose-800">{t.chemicalOption}</span>
          <div className="text-sm font-bold text-[#C62828]">{diagnosis.chemicalCategory || '—'}</div>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-amber-200/50 bg-[#FFF8E1] p-3">
        <div>
          <span className="mb-1 block text-[11px] font-black uppercase tracking-wider text-amber-800">{t.bestSpray}</span>
          <span className="text-sm font-bold text-zinc-700">{sprayWindow}</span>
        </div>
        <Clock className="h-5 w-5 flex-shrink-0 text-amber-700" />
      </div>

      <button type="button" onClick={() => setExpanded((value) => !value)} className="w-full rounded-xl border border-[#2E7D32]/10 py-2.5 text-sm font-bold text-[#2E7D32]">
        {t.learnMore} {expanded ? '▲' : '▼'}
      </button>
      {expanded && (
        <div className="space-y-2 rounded-xl border border-zinc-100 bg-zinc-50 p-3 text-sm font-semibold text-zinc-600">
          <p>{diagnosis.preventionAdvice}</p>
          {diagnosis.visibleIndicators?.map((item) => <p key={item}>• {item}</p>)}
          {diagnosis.questionsForAccuracy?.map((item) => <p key={item}>? {item}</p>)}
          {diagnosis.disclaimer && <p className="border-t border-zinc-200 pt-2 text-xs">{diagnosis.disclaimer}</p>}
        </div>
      )}
    </div>
  );
}
