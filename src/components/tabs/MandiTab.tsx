'use client';

import { useEffect, useMemo, useState } from 'react';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
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

function hint(direction: MandiResponse['trend']['direction']): string {
  if (direction === 'rising') return 'भाव बढ़ रहे हैं — गुणवत्ता और कटाई की तैयारी सही हो तो बिक्री पर विचार करें / Prices are rising — consider selling if crop quality and harvest readiness are suitable.';
  if (direction === 'falling') return 'भाव नीचे जा रहे हैं — भंडारण लागत और खराब होने के जोखिम की तुलना करें / Prices are falling — compare storage cost against spoilage risk before waiting.';
  return 'भाव स्थिर हैं — निकटतम मंडी, परिवहन लागत और फसल की परिपक्वता की तुलना करें / Prices are stable — compare nearby markets, transport cost and crop maturity.';
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
    return [...current.records].sort((a, b) => new Date(b.arrivalDate).getTime() - new Date(a.arrivalDate).getTime())[0];
  }, [current]);

  const TrendIcon = current?.trend.direction === 'rising' ? TrendingUp : current?.trend.direction === 'falling' ? TrendingDown : Minus;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {CROPS.map((crop) => (
          <button key={crop.key} type="button" onClick={() => setSelected(crop.key)} className={`rounded-full border px-4 py-2 text-sm font-black transition ${selected === crop.key ? 'border-[#2E7D32] bg-[#2E7D32] text-white' : 'border-[#2E7D32]/20 bg-white text-[#2E7D32]'}`}>
            {crop.label} / {crop.key}
          </button>
        ))}
      </div>

      {loading && <div className="m3-card text-center text-sm font-semibold text-zinc-500">{t.loading}</div>}

      {current && record && (
        <>
          <div className={`rounded-3xl border p-4 ${current.trend.direction === 'falling' ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-emerald-200 bg-emerald-50 text-emerald-900'}`}>
            <div className="flex items-start gap-3"><TrendIcon className="mt-0.5 h-5 w-5 flex-shrink-0" /><p className="text-sm font-black">{hint(current.trend.direction)}</p></div>
          </div>

          <div className="m3-card">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <span className="mb-1 block text-xs font-bold uppercase text-zinc-400">{record.market}, {record.district}, {record.state}</span>
                <h2 className="text-2xl font-black text-zinc-800">{record.commodity}</h2>
                <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-black ${current.dataSource === 'live' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}>
                  {current.dataSource === 'live' ? t.livePrice : `${t.lastKnown}: ${record.arrivalDate}`}
                </span>
              </div>
              <TrendIcon className={`h-8 w-8 ${current.trend.direction === 'falling' ? 'text-[#C62828]' : 'text-[#2E7D32]'}`} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-zinc-50 p-4 text-center">
                <span className="block text-xs font-bold text-zinc-500">Modal price</span>
                <span className="block text-2xl font-black text-[#2E7D32]">₹{Math.round(record.modalPrice).toLocaleString('en-IN')}</span>
                <span className="block text-xs font-bold text-zinc-500">per quintal</span>
              </div>
              <div className="rounded-2xl bg-zinc-50 p-4 text-center">
                <span className="block text-xs font-bold text-zinc-500">7-day trend</span>
                <span className={`block text-2xl font-black ${current.trend.direction === 'falling' ? 'text-[#C62828]' : 'text-[#2E7D32]'}`}>{current.trend.percent > 0 ? '↑' : current.trend.percent < 0 ? '↓' : '→'} {Math.abs(current.trend.percent)}%</span>
                <span className="block text-xs font-bold capitalize text-zinc-500">{current.trend.direction}</span>
              </div>
            </div>

            <div className="mt-3 rounded-2xl border border-zinc-100 p-3 text-sm font-bold text-zinc-700">
              Min–Max: ₹{Math.round(record.minPrice).toLocaleString('en-IN')} – ₹{Math.round(record.maxPrice).toLocaleString('en-IN')} / quintal
            </div>
          </div>

          <div className="m3-card space-y-3">
            <span className="block text-xs font-bold uppercase tracking-wider text-zinc-500">Nearby / recent markets</span>
            {current.records.slice(0, 5).map((item, index) => (
              <div key={`${item.market}-${item.arrivalDate}-${index}`} className="flex items-center justify-between border-b border-zinc-50 py-2.5 text-sm font-bold text-zinc-700 last:border-0">
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
