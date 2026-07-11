'use client';

import { useMemo, useState } from 'react';
import { AlertCircle, ClipboardList, Clock, Info, Volume2, VolumeX } from 'lucide-react';
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
      return `${from.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}, ${formatHour(from)}-${formatHour(to)} · dry, daylight, low wind`;
    }
  }

  return 'No safe 6-hour daylight spray window found in the latest forecast. Review again later.';
}

function plainSeverity(severity: string): string {
  if (severity === 'critical') return 'Critical: act immediately and contact an expert.';
  if (severity === 'high') return 'High: act soon and monitor spread closely.';
  if (severity === 'medium') return 'Medium: early action can prevent crop loss.';
  if (severity === 'low') return 'Low: monitor and repeat scan if symptoms spread.';
  if (severity === 'healthy') return 'Healthy: no meaningful disease signal visible.';
  return 'Unclear: upload a clearer crop photo before treatment.';
}

export default function DiagnosisCard({ diagnosis, t, lang, hourlyWeather }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const isLive = diagnosis.dataSource === 'live';
  const sprayWindow = useMemo(() => findSprayWindow(hourlyWeather), [hourlyWeather]);
  const topIndicators = diagnosis.visibleIndicators?.length ? diagnosis.visibleIndicators.slice(0, 4) : ['No clear visual indicators were returned. Upload a sharper close-up and one full-plant photo.'];
  const evidenceQuestions = diagnosis.questionsForAccuracy?.length ? diagnosis.questionsForAccuracy.slice(0, 3) : ['Which part is affected: leaf, stem, flower, or fruit?', 'How many plants show the same symptom?'];

  const healthStyle = diagnosis.severity === 'critical' || diagnosis.severity === 'high'
    ? 'border-rose-200 bg-rose-50 text-rose-700'
    : diagnosis.severity === 'medium'
      ? 'border-amber-200 bg-amber-50 text-amber-700'
      : diagnosis.severity === 'unknown'
        ? 'border-zinc-200 bg-zinc-100 text-zinc-700'
        : 'border-[#C9D7CF] bg-[#F1F5F2] text-[#52665B]';

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
    const utterance = new SpeechSynthesisUtterance(`${diagnosis.mostLikelyIssue}. ${plainSeverity(diagnosis.severity)} ${diagnosis.immediateAction}. ${sprayWindow}`);
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
        <button type="button" onClick={speak} className="flex min-h-12 min-w-12 items-center justify-center rounded-full border border-zinc-200 bg-white text-[#555D58] shadow-sm" aria-label={speaking ? t.stopSpeech : t.readAloud}>
          {speaking ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
      </div>

      <div className="rounded-2xl border border-[#DCE3DE] bg-[#F6F8F6] p-4">
        <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase text-[#5D6B63]">
          <Info className="h-4 w-4" /> Disease understanding
        </div>
        <h3 className="mb-2 text-lg font-black text-[#242824]">{diagnosis.mostLikelyIssue}</h3>
        <p className="text-sm font-bold leading-relaxed text-[#4F5D55]">{plainSeverity(diagnosis.severity)}</p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-white p-2 shadow-sm">
            <span className="block text-[10px] font-black uppercase text-zinc-400">Confidence</span>
            <strong className="text-sm text-[#303733]">{Math.max(0, Math.min(100, diagnosis.confidence))}%</strong>
          </div>
          <div className="rounded-2xl bg-white p-2 shadow-sm">
            <span className="block text-[10px] font-black uppercase text-zinc-400">Image</span>
            <strong className="text-sm capitalize text-[#303733]">{diagnosis.imageQuality || 'unknown'}</strong>
          </div>
          <div className="rounded-2xl bg-white p-2 shadow-sm">
            <span className="block text-[10px] font-black uppercase text-zinc-400">Crop?</span>
            <strong className="text-sm capitalize text-[#303733]">{diagnosis.imageCategory || 'unclear'}</strong>
          </div>
        </div>
        {isLive && (
          <div className="mt-3 flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white">
              <div className="h-full rounded-full bg-gradient-to-r from-[#6D7C74] to-[#B69A6A]" style={{ width: `${Math.max(0, Math.min(100, diagnosis.confidence))}%` }} />
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-zinc-100 bg-[#FAFAF8] p-3.5">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-zinc-500">
          <AlertCircle className="h-4 w-4 text-[#69756F]" /> {t.whatToDo}
        </div>
        <ul className="space-y-2 text-sm font-semibold leading-relaxed text-zinc-700">
          {(diagnosis.immediateAction || '').split('\n').filter(Boolean).slice(0, 3).map((step, index) => (
            <li key={`${step}-${index}`} className="flex items-start gap-2"><span className="font-extrabold text-[#8C7652]">•</span><span>{step}</span></li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-[#E4DCCB] bg-[#FCFAF5] p-3.5">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#8A6B3D]">
          <ClipboardList className="h-4 w-4" /> Signs seen in photo
        </div>
        <ul className="space-y-2 text-sm font-semibold leading-relaxed text-zinc-700">
          {topIndicators.map((indicator, index) => (
            <li key={`${indicator}-${index}`} className="flex items-start gap-2"><span className="font-extrabold text-[#8C7652]">•</span><span>{indicator}</span></li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-[#DCE3DE] bg-[#F6F8F6] p-3">
          <span className="mb-1 block text-[11px] font-black tracking-wider text-[#5D6B63]">{t.organicOption}</span>
          {diagnosis.organicOptions?.length ? diagnosis.organicOptions.map((option) => <div key={option} className="text-sm font-bold text-[#4F5D55]">{option}</div>) : <div className="text-sm font-semibold text-zinc-500">-</div>}
        </div>
        <div className="rounded-2xl border border-rose-100 bg-[#FFF8F8] p-3">
          <span className="mb-1 block text-[11px] font-black tracking-wider text-rose-700">{t.chemicalOption}</span>
          <div className="text-sm font-bold text-[#A84450]">{diagnosis.chemicalCategory || '-'}</div>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-[#E4D4B4] bg-[#FBF6EC] p-3">
        <div>
          <span className="mb-1 block text-[11px] font-black uppercase tracking-wider text-[#8A6B3D]">{t.bestSpray}</span>
          <span className="text-sm font-bold text-zinc-700">{sprayWindow}</span>
        </div>
        <Clock className="h-5 w-5 flex-shrink-0 text-[#A4824F]" />
      </div>

      {diagnosis.requiresExpert && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm font-black text-rose-800">
          Expert review recommended before applying treatment.
        </div>
      )}

      <button type="button" onClick={() => setExpanded((value) => !value)} className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 text-sm font-bold text-[#4E5752] shadow-sm">
        {expanded ? 'Hide details' : 'Show why and next questions'} {expanded ? '▲' : '▼'}
      </button>
      {expanded && (
        <div className="space-y-2 rounded-xl border border-zinc-100 bg-[#FAFAF8] p-3 text-sm font-semibold text-zinc-600">
          <p>{diagnosis.preventionAdvice}</p>
          {diagnosis.alternativePossibilities?.slice(0, 3).map((item) => <p key={item}>Possible: {item}</p>)}
          {evidenceQuestions.map((item) => <p key={item}>Question: {item}</p>)}
          {diagnosis.disclaimer && <p className="border-t border-zinc-200 pt-2 text-xs">{diagnosis.disclaimer}</p>}
        </div>
      )}
    </div>
  );
}
