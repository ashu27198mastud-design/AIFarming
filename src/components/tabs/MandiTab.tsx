'use client';

import { useEffect, useMemo, useState } from 'react';
import { MapPin, Minus, TrendingDown, TrendingUp } from 'lucide-react';
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
  market: { state: string; district: string; distanceKm: number; village?: string };
};

function parseArrivalDate(value: string): number {
  const direct = new Date(value).getTime();
  if (Number.isFinite(direct)) return direct;
  const [day, month, year] = value.split(/[/-]/).map(Number);
  return day && month && year ? new Date(year, month - 1, day).getTime() : 0;
}

function decision(direction: MandiResponse['trend']['direction']): string {
  if (direction === 'rising') return 'Sell-ready';
  if (direction === 'falling') return 'Compare or wait';
  return 'Stable';
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
      return [crop.key, await response.json() as MandiResponse] as const;
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

  const TrendIcon = current?.trend.direction === 'rising' ? TrendingUp : current?.trend.direction === 'falling' ? TrendingDown : Minus;

  return (
    <div className="space-y-4">
      <section className="m3-card flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="section-kicker">Nearest market</span>
          <h2 className="mt-1 truncate text-xl font-bold text-[#202124]">{market.district}</h2>
          <p className="mt-1 text-xs font-medium text-[#5F6368]">{market.village || market.district} · {market.distanceKm} km</p>
        </div>
        <span className="google-icon google-icon-blue"><MapPin className="h-5 w-5" /></span>
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {CROPS.map((crop) => (
          <button key={crop.key} type="button" onClick={() => setSelected(crop.key)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${selected === crop.key ? 'bg-[#1A73E8] text-white' : 'border border-[#DADCE0] bg-white text-[#3C4043]'}`}>
            {crop.label}
          </button>
        ))}
      </div>

      {loading && <div className="m3-card text-center text-sm font-medium text-[#5F6368]">{t.loading}</div>}

      {current && record && (
        <>
          <section className="m3-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="section-kicker">{record.commodity}</span>
                <div className="mt-2 flex items-end gap-2">
                  <strong className="text-3xl font-bold text-[#202124]">₹{Math.round(record.modalPrice).toLocaleString('en-IN')}</strong>
                  <span className="pb-1 text-xs font-medium text-[#5F6368]">/ quintal</span>
                </div>
                <p className="mt-2 text-xs font-medium text-[#5F6368]">₹{Math.round(record.minPrice).toLocaleString('en-IN')} – ₹{Math.round(record.maxPrice).toLocaleString('en-IN')}</p>
              </div>
              <div className={`rounded-2xl px-3 py-2 text-right ${current.trend.direction === 'rising' ? 'bg-[#E6F4EA] text-[#137333]' : current.trend.direction === 'falling' ? 'bg-[#FCE8E6] text-[#C5221F]' : 'bg-[#F1F3F4] text-[#5F6368]'}`}>
                <TrendIcon className="ml-auto h-5 w-5" />
                <strong className="mt-1 block text-sm">{current.trend.percent > 0 ? '+' : ''}{current.trend.percent}%</strong>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#F8F9FA] px-4 py-3">
              <span className="text-sm font-semibold text-[#3C4043]">{decision(current.trend.direction)}</span>
              <span className={`text-xs font-semibold ${current.dataSource === 'live' ? 'text-[#137333]' : 'text-[#B06000]'}`}>
                {current.dataSource === 'live' ? t.livePrice : `${t.lastKnown} · ${record.arrivalDate}`}
              </span>
            </div>
          </section>

          <section className="m3-card">
            <span className="section-kicker">Nearby</span>
            <div className="mt-3 divide-y divide-[#EEF0EF]">
              {current.records.slice(0, 5).map((item, index) => (
                <div key={`${item.market}-${item.arrivalDate}-${index}`} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <span className="truncate font-medium text-[#3C4043]">{item.market}</span>
                  <strong className="whitespace-nowrap text-[#202124]">₹{Math.round(item.modalPrice).toLocaleString('en-IN')}</strong>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
