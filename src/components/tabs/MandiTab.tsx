'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Minus, ShieldCheck, TrendingDown, TrendingUp } from 'lucide-react';
import type { TranslationSet } from '@/lib/i18n';

const CROPS = [
  { key: 'Tomato', label: 'टमाटर' },
  { key: 'Onion', label: 'प्याज़' },
  { key: 'Wheat', label: 'गेहूं' },
  { key: 'Soyabean', label: 'सोयाबीन' },
  { key: 'Cotton', label: 'कपास' },
];

type MandiRecord = {
  commodity: string;
  market: string;
  district: string;
  state: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  arrivalDate: string;
};

type MandiResponse = {
  records: MandiRecord[];
  trend: { direction: 'rising' | 'falling' | 'stable'; percent: number };
  dataSource: 'live' | 'fallback';
  fetchedAt: string;
};

type Props = {
  t: TranslationSet;
  market: { state: string; district: string };
};

function parseArrivalDate(value: string): number {
  const direct = new Date(value).getTime();
  if (Number.isFinite(direct)) return direct;
  const parts = value.split(/[/-]/).map(Number);
  if (parts.length === 3) {
    const [day, month, year] = parts;
    const parsed = new Date(year, month - 1, day).getTime();
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function hint(direction: MandiResponse['trend']['direction']): string {
  if (direction === 'rising') return 'भाव बढ़ रहे हैं — गुणवत्ता और कटाई की तैयारी सही हो तो बिक्री पर विचार करें / Prices are rising — consider selling if crop quality and harvest readiness are suitable.';
  if (direction === 'falling') return 'भाव नीचे जा रहे हैं — भंडारण लागत और खराब होने के जोखिम की तुलना करें / Prices are falling — compare storage cost against spoilage risk before waiting.';
  return 'भाव स्थिर हैं — निकटतम मंडी, परिवहन लागत और फसल की परिपक्वता की तुलना करें / Prices are stable — compare nearby markets, transport cost and crop maturity.';
}

function dailyBriefing(current: MandiResponse, record: MandiRecord): string[] {
  const trendLine = current.trend.direction === 'rising'
    ? `${record.commodity} is up ${Math.abs(current.trend.percent)}%: prepare graded produce and compare buyers.`
    : current.trend.direction === 'falling'
      ? `${record.commodity} is down ${Math.abs(current.trend.percent)}%: check storage and spoilage cost before waiting.`
      : `${record.commodity} prices are stable: transport cost may decide the best mandi.`;
  const spread = record.maxPrice - record.minPrice;
  const spreadLine = spread > record.modalPrice * 0.25
    ? 'Wide price range today: quality grading and buyer comparison can materially change your return.'
    : 'Price range is relatively tight: prioritize the nearest reliable buyer and lower transport cost.';
  const sourceLine = current.dataSource === 'live'
    ? `Live mandi records refreshed ${new Date(current.fetchedAt).toLocaleDateString('en-IN')}.`
    : `Latest live record is unavailable; showing last-known data dated ${record.arrivalDate}.`;
  return [trendLine, spreadLine, sourceLine];
}

function marketDecision(current: MandiResponse, record: MandiRecord): { label: string; detail: string; score: number; tone: string } {
  const spread = record.maxPrice > 0 ? ((record.maxPrice - record.minPrice) / record.maxPrice) * 100 : 0;
  const trendLift = current.trend.direction === 'rising' ? 28 : current.trend.direction === 'stable' ? 14 : -8;
  const priceQuality = record.modalPrice >= record.maxPrice * 0.82 ? 28 : record.modalPrice >= record.maxPrice * 0.68 ? 18 : 8;
  const stability = spread < 22 ? 18 : spread < 35 ? 10 : 4;
  const score = Math.max(0, Math.min(100, Math.round(30 + trendLift + priceQuality + stability)));

  if (score >= 78) {
    return {
      label: 'Sell-ready signal',
      detail: 'Price, trend, and spread look favorable. Sell if crop is mature and transport cost is acceptable.',
      score,
      tone: 'good',
    };
  }
  if (score >= 58) {
    return {
      label: 'Compare before selling',
      detail: 'Signal is mixed. Compare nearby markets and check harvest readiness before committing.',
      score,
      tone: 'watch',
    };
  }
  return {
    label: 'Wait or protect quality',
    detail: 'Current signal is weak. Waiting may help only if storage quality and spoilage risk are manageable.',
    score,
    tone: 'danger',
  };
}

export default function MandiTab({ t, market }: Props) {
  const [selected, setSelected] = useState('Tomato');
  const [prices, setPrices] = useState<Record<string, MandiResponse>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    Promise.all(CROPS.map(async (crop) => {
      const url = `/api/mandi?state=${encodeURIComponent(market.state)}&district=${encodeURIComponent(market.district)}&commodity=${encodeURIComponent(crop.key)}`;
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error('Mandi request failed');
      const payload = await response.json() as MandiResponse;
      return [crop.key, payload] as const;
    }))
      .then((entries) => setPrices(Object.fromEntries(entries)))
      .catch((error) => {
        if ((error as Error).name !== 'AbortError') console.error('Mandi data failed:', error);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [market.district, market.state]);

  const current = prices[selected];
  const record = useMemo(() => {
    if (!current?.records.length) return null;
    return [...current.records].sort((a, b) => parseArrivalDate(b.arrivalDate) - parseArrivalDate(a.arrivalDate))[0];
  }, [current]);
  const decision = current && record ? marketDecision(current, record) : null;
  const news = current && record ? dailyBriefing(current, record) : [];

  const TrendIcon = current?.trend.direction === 'rising' ? TrendingUp : current?.trend.direction === 'falling' ? TrendingDown : Minus;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {CROPS.map((crop) => (
          <button
            key={crop.key}
            type="button"
            onClick={() => setSelected(crop.key)}
            className={`rounded-full border px-4 py-2 text-sm font-black shadow-sm transition ${selected === crop.key ? 'border-[#3D4541] bg-[#303733] text-white' : 'border-zinc-200 bg-white text-[#555D58] hover:border-[#CDBA94]'}`}
          >
            {crop.label} / {crop.key}
          </button>
        ))}
      </div>

      {loading && <div className="m3-card text-center text-sm font-semibold text-zinc-500">{t.loading}</div>}

      {current && record && decision && (
        <>
          <section className="m3-card space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="section-kicker"><CalendarDays className="h-3.5 w-3.5 text-[#61788D]" /> Today&apos;s mandi news</span>
              <span className="metric-pill">{new Date(current.fetchedAt).toLocaleDateString('en-IN')}</span>
            </div>
            {news.map((item, index) => (
              <div key={item} className="flex gap-3 border-b border-zinc-100 pb-3 text-sm font-semibold leading-relaxed text-zinc-700 last:border-0 last:pb-0">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#EEF2F5] text-[11px] font-black text-[#52687A]">{index + 1}</span>
                <p>{item}</p>
              </div>
            ))}
          </section>

          <div className={`rounded-3xl border p-4 ${decision.tone === 'danger' ? 'border-rose-200 bg-rose-50 text-rose-800' : decision.tone === 'watch' ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-[#D9E0DB] bg-[#F5F7F5] text-[#4B5750]'}`}>
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <p className="text-sm font-black">{decision.label}</p>
                  <span className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-black">{decision.score}/100</span>
                </div>
                <p className="text-sm font-bold leading-relaxed">{decision.detail}</p>
              </div>
            </div>
          </div>

          <div className={`rounded-3xl border p-4 ${current.trend.direction === 'falling' ? 'border-amber-200 bg-amber-50 text-amber-900' : current.trend.direction === 'rising' ? 'border-[#D9E0DB] bg-[#F5F7F5] text-[#4B5750]' : 'border-zinc-200 bg-zinc-50 text-zinc-700'}`}>
            <div className="flex items-start gap-3"><TrendIcon className="mt-0.5 h-5 w-5 flex-shrink-0" /><p className="text-sm font-black">{hint(current.trend.direction)}</p></div>
          </div>

          <div className="m3-card">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <span className="mb-1 block text-xs font-bold uppercase text-zinc-400">{record.market}, {record.district}, {record.state}</span>
                <h2 className="text-2xl font-black text-[#242824]">{record.commodity}</h2>
                <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-black ${current.dataSource === 'live' ? 'bg-[#EEF3F0] text-[#53655B]' : 'bg-amber-50 text-amber-800'}`}>
                  {current.dataSource === 'live' ? t.livePrice : `${t.lastKnown}: ${record.arrivalDate}`}
                </span>
              </div>
              <TrendIcon className={`h-8 w-8 ${current.trend.direction === 'falling' ? 'text-[#A84450]' : current.trend.direction === 'rising' ? 'text-[#65776E]' : 'text-zinc-500'}`} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-zinc-100 bg-[#FAFAF8] p-4 text-center">
                <span className="block text-xs font-bold text-zinc-500">Modal price</span>
                <span className="block text-2xl font-black text-[#2F3632]">₹{Math.round(record.modalPrice).toLocaleString('en-IN')}</span>
                <span className="block text-xs font-bold text-zinc-500">per quintal</span>
              </div>
              <div className="rounded-2xl border border-zinc-100 bg-[#FAFAF8] p-4 text-center">
                <span className="block text-xs font-bold text-zinc-500">7-day trend</span>
                <span className={`block text-2xl font-black ${current.trend.direction === 'falling' ? 'text-[#A84450]' : current.trend.direction === 'rising' ? 'text-[#65776E]' : 'text-zinc-600'}`}>{current.trend.percent > 0 ? '↑' : current.trend.percent < 0 ? '↓' : '→'} {Math.abs(current.trend.percent)}%</span>
                <span className="block text-xs font-bold capitalize text-zinc-500">{current.trend.direction}</span>
              </div>
            </div>

            <div className="mt-3 rounded-2xl border border-[#E4DCCB] bg-[#FCFAF5] p-3 text-sm font-bold text-zinc-700">
              Min–Max: ₹{Math.round(record.minPrice).toLocaleString('en-IN')} – ₹{Math.round(record.maxPrice).toLocaleString('en-IN')} / quintal
            </div>
          </div>

          <div className="m3-card space-y-3">
            <span className="block text-xs font-bold uppercase tracking-wider text-zinc-500">Nearby / recent markets</span>
            {current.records.slice(0, 5).map((item, index) => (
              <div key={`${item.market}-${item.arrivalDate}-${index}`} className="flex items-center justify-between border-b border-zinc-100 py-2.5 text-sm font-bold text-zinc-700 last:border-0">
                <span>{item.market}</span>
                <span>₹{Math.round(item.modalPrice).toLocaleString('en-IN')} <span className="text-xs text-zinc-400">{item.arrivalDate}</span></span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
