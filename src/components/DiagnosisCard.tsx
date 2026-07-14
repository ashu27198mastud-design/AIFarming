'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, Clock, Volume2, VolumeX } from 'lucide-react';
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
      return `${from.toLocaleDateString('en-IN', { weekday: 'short' })} · ${formatHour(from)}–${formatHour(to)}`;
    }
  }
  return 'No safe window';
}

function severityLabel(severity: string): string {
  if (severity === 'critical' || severity === 'high') return 'High risk';
  if (severity === 'medium') return 'Needs attention';
  if (severity === 'healthy' || severity === 'low') return 'Low risk';
  return 'Unclear';
}

export default function DiagnosisCard({ diagnosis, t, lang, hourlyWeather }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const isLive = diagnosis.dataSource === 'live';
  const sprayWindow = useMemo(() => findSprayWindow(hourlyWeather), [hourlyWeather]);
  const actions = (diagnosis.immediateAction || '').split('\n').filter(Boolean).slice(0, 2);

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

  const tone = diagnosis.severity === 'critical' || diagnosis.severity === 'high'
    ? 'bg-[#FCE8E6] text-[#C5221F]'
    : diagnosis.severity === 'medium'
      ? 'bg-[#FEF7E0] text-[#B06000]'
      : diagnosis.severity === 'unknown'
        ? 'bg-[#F1F3F4] text-[#5F6368]'
        : 'bg-[#E6F4EA] text-[#137333]';

  return (
    <div className="space-y-3 border-t border-[#EEF0EF] pt-4">
      {!isLive && <div className="rounded-2xl bg-[#FEF7E0] px-4 py-3 text-sm font-semibold text-[#B06000]">{t.demoBanner}</div>}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>{severityLabel(diagnosis.severity)}</span>
          <h3 className="mt-3 text-xl font-bold text-[#202124]">{diagnosis.mostLikelyIssue}</h3>
        </div>
        <button type="button" onClick={speak} className="glass-icon-button flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full" aria-label={speaking ? t.stopSpeech : t.readAloud}>
          {speaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      </div>

      {isLive && (
        <div className="flex items-center gap-3 rounded-2xl bg-[#F8F9FA] px-4 py-3">
          <span className="text-xs font-medium text-[#5F6368]">Confidence</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#E0E3E7]"><div className="h-full rounded-full bg-[#1A73E8]" style={{ width: `${Math.max(0, Math.min(100, diagnosis.confidence))}%` }} /></div>
          <strong className="text-xs text-[#3C4043]">{Math.round(diagnosis.confidence)}%</strong>
        </div>
      )}

      <div className="rounded-2xl bg-[#F8F9FA] p-4">
        <span className="section-kicker">{t.whatToDo}</span>
        <div className="mt-2 space-y-2">
          {actions.length ? actions.map((step, index) => <p key={`${step}-${index}`} className="text-sm font-medium leading-relaxed text-[#3C4043]">{index + 1}. {step}</p>) : <p className="text-sm text-[#5F6368]">Retake a clear photo</p>}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-[#E8F0FE] px-4 py-3">
        <div>
          <span className="text-[10px] font-semibold uppercase text-[#1967D2]">{t.bestSpray}</span>
          <p className="mt-1 text-sm font-semibold text-[#174EA6]">{sprayWindow}</p>
        </div>
        <Clock className="h-5 w-5 text-[#1A73E8]" />
      </div>

      <button type="button" onClick={() => setExpanded((value) => !value)} className="flex w-full items-center justify-between rounded-2xl border border-[#DADCE0] bg-white px-4 py-3 text-sm font-semibold text-[#3C4043]">
        Details<ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="space-y-3 rounded-2xl border border-[#E4E7E5] bg-white p-4 text-sm text-[#5F6368]">
          {diagnosis.visibleIndicators?.slice(0, 3).map((item) => <p key={item}>• {item}</p>)}
          {diagnosis.organicOptions?.[0] && <p><strong className="text-[#3C4043]">Organic:</strong> {diagnosis.organicOptions[0]}</p>}
          {diagnosis.chemicalCategory && <p><strong className="text-[#3C4043]">Chemical:</strong> {diagnosis.chemicalCategory}</p>}
          {diagnosis.preventionAdvice && <p>{diagnosis.preventionAdvice}</p>}
          {diagnosis.disclaimer && <p className="border-t border-[#EEF0EF] pt-3 text-xs">{diagnosis.disclaimer}</p>}
        </div>
      )}
    </div>
  );
}
