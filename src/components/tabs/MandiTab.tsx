'use client';

import { useEffect, useMemo, useState } from 'react';
import { Gavel, Info, MapPin, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import type { LanguageCode, TranslationSet } from '@/lib/i18n';
import { formatLocality, formatMarketName } from '@/lib/locality';

const CROPS = [
  { key: 'Tomato', label: { en: 'Tomato', hi: 'टमाटर', mr: 'टोमॅटो' } },
  { key: 'Onion', label: { en: 'Onion', hi: 'प्याज', mr: 'कांदा' } },
  { key: 'Wheat', label: { en: 'Wheat', hi: 'गेहूं', mr: 'गहू' } },
  { key: 'Soyabean', label: { en: 'Soyabean', hi: 'सोयाबीन', mr: 'सोयाबीन' } },
  { key: 'Cotton', label: { en: 'Cotton', hi: 'कपास', mr: 'कापूस' } },
];

const BID_COPY = {
  en: {
    title: 'Live auction demand',
    subtitle: 'Open lot bids from the linked mandi',
    unavailable: 'Live auction bids are not linked for this market yet. Use the price guidance above and confirm locally before selling.',
    highestBid: 'Highest bid',
    openLots: 'Open lots',
    arrival: 'Arrival',
    closes: 'Closes',
    open: 'Open',
    unavailablePill: 'Not linked',
    lot: 'Lot',
    bags: 'bags',
    quintal: 'quintal',
  },
  hi: {
    title: 'ताज़ा बोली संकेत',
    subtitle: 'जुड़ी मंडी के खुले लॉट',
    unavailable: 'इस बाजार के लिए ताज़ा बोली अभी जुड़ी नहीं है। ऊपर दिए भाव सल्लाह का उपयोग करें और बेचने से पहले स्थानीय पुष्टि करें।',
    highestBid: 'सबसे ऊंची बोली',
    openLots: 'खुले लॉट',
    arrival: 'आवक',
    closes: 'बंद समय',
    open: 'खुली',
    unavailablePill: 'नहीं जुड़ा',
    lot: 'लॉट',
    bags: 'बोरी',
    quintal: 'क्विंटल',
  },
  mr: {
    title: 'ताजे लिलाव संकेत',
    subtitle: 'जोडलेल्या बाजारपेठेतील खुले लॉट',
    unavailable: 'या बाजारासाठी ताजी बोली अजून जोडलेली नाही. वरचा भाव सल्ला वापरा आणि विक्रीपूर्वी स्थानिक खात्री करा.',
    highestBid: 'सर्वोच्च बोली',
    openLots: 'खुले लॉट',
    arrival: 'आवक',
    closes: 'बंद वेळ',
    open: 'खुली',
    unavailablePill: 'जोडलेले नाही',
    lot: 'लॉट',
    bags: 'गोण्या',
    quintal: 'क्विंटल',
  },
} as const;

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

type BidRecord = {
  lotCode: string;
  bags: number;
  weightQuintal: number;
  bidStatus: 'open' | 'closed' | 'unknown';
  maxBidValue: number;
  bidEndTime: string;
};

type BidSummary = {
  lots: number;
  openLots: number;
  highestBid: number;
  totalWeightQuintal: number;
  rateUom: string;
  closesAt: string;
};

type BidResponse = {
  bids: BidRecord[];
  summary: BidSummary;
  dataSource: 'live' | 'unavailable';
  reason?: string;
  fetchedAt: string;
};

type Props = {
  t: TranslationSet;
  lang: LanguageCode;
  market: { state: string; district: string; distanceKm: number; village?: string; apmcName?: string };
};

const EMPTY_BID_SUMMARY: BidSummary = {
  lots: 0,
  openLots: 0,
  highestBid: 0,
  totalWeightQuintal: 0,
  rateUom: 'QUINTAL',
  closesAt: '',
};

function parseArrivalDate(value: string): number {
  const direct = new Date(value).getTime();
  if (Number.isFinite(direct)) return direct;
  const [day, month, year] = value.split(/[/-]/).map(Number);
  return day && month && year ? new Date(year, month - 1, day).getTime() : 0;
}

function cropLabel(crop: typeof CROPS[number], lang: string): string {
  if (lang === 'hi' || lang === 'mr' || lang === 'en') return crop.label[lang];
  return crop.label.en;
}

function bidCopy(lang: string) {
  if (lang === 'hi' || lang === 'mr' || lang === 'en') return BID_COPY[lang];
  return BID_COPY.en;
}

function decision(direction: MandiResponse['trend']['direction'], t: TranslationSet): string {
  if (direction === 'rising') return t.sellReady;
  if (direction === 'falling') return t.compareOrWait;
  return t.stable;
}

function cropAdvice(response: MandiResponse, distanceKm: number, t: TranslationSet): string {
  if (response.trend.direction === 'rising') return t.priceRisingAdvice + ' ' + distanceKm + ' km.';
  if (response.trend.direction === 'falling') return t.priceFallingAdvice;
  return t.priceStableAdvice;
}

function sourceDetail(response: MandiResponse, t: TranslationSet): string {
  if (response.dataSource === 'live') return t.liveSource;
  return t.fallbackSource;
}

function formatBidDate(value: string, lang: string): string {
  const time = new Date(value).getTime();
  if (!Number.isFinite(time)) return '';
  const locale = lang === 'mr' ? 'mr-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(time));
}

export default function MandiTab({ t, lang, market }: Props) {
  const [selected, setSelected] = useState('Tomato');
  const [prices, setPrices] = useState<Record<string, MandiResponse>>({});
  const [loading, setLoading] = useState(true);
  const [bidInfo, setBidInfo] = useState<BidResponse | null>(null);
  const [bidLoading, setBidLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const loadingTimer = window.setTimeout(() => {
      if (active) setLoading(true);
    }, 0);
    Promise.all(CROPS.map(async (crop) => {
      const url = `/api/mandi?state=${encodeURIComponent(market.state)}&district=${encodeURIComponent(market.district)}&commodity=${encodeURIComponent(crop.key)}`;
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error('Mandi request failed');
      return [crop.key, await response.json() as MandiResponse] as const;
    }))
      .then((entries) => {
        if (active) setPrices(Object.fromEntries(entries));
      })
      .catch((error) => {
        if ((error as Error).name !== 'AbortError') console.error('Mandi data failed:', error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      window.clearTimeout(loadingTimer);
      controller.abort();
    };
  }, [market.district, market.state]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const loadingTimer = window.setTimeout(() => {
      if (active) setBidLoading(true);
    }, 0);
    const url = `/api/bids?language=${encodeURIComponent(lang)}&state=${encodeURIComponent(market.state)}&district=${encodeURIComponent(market.district)}&commodity=${encodeURIComponent(selected)}`;
    fetch(url, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Bid request failed');
        return response.json() as Promise<BidResponse>;
      })
      .then((payload) => {
        if (active) setBidInfo(payload);
      })
      .catch((error) => {
        if ((error as Error).name !== 'AbortError') console.error('Bid data failed:', error);
        if (active) setBidInfo({ bids: [], summary: EMPTY_BID_SUMMARY, dataSource: 'unavailable', reason: 'request_failed', fetchedAt: new Date().toISOString() });
      })
      .finally(() => {
        if (active) setBidLoading(false);
      });
    return () => {
      active = false;
      window.clearTimeout(loadingTimer);
      controller.abort();
    };
  }, [lang, market.district, market.state, selected]);

  const current = prices[selected];
  const record = useMemo(() => {
    if (!current?.records.length) return null;
    return [...current.records].sort((a, b) => parseArrivalDate(b.arrivalDate) - parseArrivalDate(a.arrivalDate))[0];
  }, [current]);

  const TrendIcon = current?.trend.direction === 'rising' ? TrendingUp : current?.trend.direction === 'falling' ? TrendingDown : Minus;
  const selectedCrop = CROPS.find((crop) => crop.key === selected) ?? CROPS[0];
  const selectedCropLabel = cropLabel(selectedCrop, lang);
  const bidsCopy = bidCopy(lang);
  const hasLiveBids = bidInfo?.dataSource === 'live' && bidInfo.summary.highestBid > 0;
  const topBids = (bidInfo?.bids ?? []).filter((bid) => bid.maxBidValue > 0).slice(0, 3);
  const closingLabel = formatBidDate(bidInfo?.summary.closesAt ?? '', lang);

  const localizedMarketName = formatMarketName(
    market.apmcName || market.district,
    { village: market.village, district: market.district, state: market.state },
    lang,
  );
  const localizedVillage = formatLocality(
    { village: market.village || market.district, district: market.district, state: market.state },
    lang,
  );
  const localizedDistrict = formatLocality(
    { village: market.district, district: market.district, state: market.state },
    lang,
  );
  const marketContext = Array.from(new Set([localizedVillage, localizedDistrict])).join(' · ');
  return (
    <div className="space-y-4">
      <section className="m3-card flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="section-kicker">{t.nearestMarket}</span>
          <h2 className="mt-1 truncate text-market-title font-bold text-[#202124]">{localizedMarketName}</h2>
          <p className="mt-1 text-meta font-medium text-[#5F6368]">{marketContext} · ~{market.distanceKm} km</p>
        </div>
        <span className="google-icon google-icon-blue"><MapPin className="h-5 w-5" /></span>
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {CROPS.map((crop) => (
          <button key={crop.key} type="button" onClick={() => setSelected(crop.key)} className={'mandi-crop-chip' + (selected === crop.key ? ' is-selected' : '')}>
            {cropLabel(crop, lang)}
          </button>
        ))}
      </div>

      {loading && <div className="m3-card text-center text-body font-medium text-[#5F6368]">{t.loading}</div>}

      {current?.dataSource === 'fallback' && (
        <div className="flex items-start gap-3 rounded-2xl border border-[#DCE8DE] bg-white/75 p-3 text-kicker font-semibold leading-relaxed text-[#5F6368] shadow-[0_10px_30px_rgba(60,64,67,0.08)]">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#188038]" aria-hidden="true" />
          <span>{t.liveMarketKeyMissing}</span>
        </div>
      )}

      {current && record && (
        <>
          <section className="m3-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="section-kicker">{selectedCropLabel}</span>
                <div className="mt-2 flex items-end gap-2">
                  <strong className="text-hero-num tabular-nums font-bold text-[#202124]">₹{Math.round(record.modalPrice).toLocaleString('en-IN')}</strong>
                  <span className="pb-1 text-kicker font-medium text-[#5F6368]">/ {t.quintal}</span>
                </div>
                <p className="mt-2 text-meta font-medium text-[#5F6368]">₹{Math.round(record.minPrice).toLocaleString('en-IN')} – ₹{Math.round(record.maxPrice).toLocaleString('en-IN')}</p>
              </div>
              <div className={`rounded-2xl px-3 py-2 text-right ${current.trend.direction === 'rising' ? 'bg-[#E6F4EA] text-[#137333]' : current.trend.direction === 'falling' ? 'bg-[#FCE8E6] text-[#C5221F]' : 'bg-[#F1F3F4] text-[#5F6368]'}`}>
                <TrendIcon className="ml-auto h-5 w-5" />
                <strong className="mt-1 block text-body">{current.trend.percent > 0 ? '+' : ''}{current.trend.percent}%</strong>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#F8F9FA] px-4 py-3">
              <span className="text-body font-semibold text-[#3C4043]">{decision(current.trend.direction, t)}</span>
              <span className={`text-kicker font-semibold ${current.dataSource === 'live' ? 'text-[#137333]' : 'text-[#B06000]'}`}>
                {current.dataSource === 'live' ? t.livePrice : `${t.lastKnown} · ${record.arrivalDate}`}
              </span>
            </div>

            <div className="mt-3 rounded-2xl border border-[#DCE8DE] bg-[#F3FAF5] p-4">
              <span className="section-kicker">{t.cropAdvice}</span>
              <p className="mt-2 text-body font-bold leading-relaxed text-[#2F4B3A]">{cropAdvice(current, market.distanceKm, t)}</p>
              <p className="mt-2 text-kicker font-semibold leading-relaxed text-[#66736C]">{sourceDetail(current, t)}</p>
            </div>
          </section>

          <section className="m3-card">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span className="section-kicker">{bidsCopy.title}</span>
                <h3 className="mt-1 text-lg font-bold text-[#202124]">{selectedCropLabel}</h3>
                <p className="mt-1 text-kicker font-semibold leading-relaxed text-[#5F6368]">{hasLiveBids ? bidsCopy.subtitle : bidsCopy.unavailable}</p>
              </div>
              <span className={`google-icon ${hasLiveBids ? 'google-icon-green' : 'google-icon-amber'}`}><Gavel className="h-5 w-5" /></span>
            </div>

            {bidLoading && <div className="mt-4 rounded-2xl bg-[#F8F9FA] p-3 text-center text-kicker font-bold text-[#5F6368]">{t.loading}</div>}

            {!bidLoading && hasLiveBids && bidInfo && (
              <>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <div className="rounded-2xl bg-[#F8FBF8] p-3">
                    <span className="text-kicker font-bold uppercase text-[#5F6368]">{bidsCopy.highestBid}</span>
                    <strong className="mt-1 block text-xl text-[#137333]">₹{Math.round(bidInfo.summary.highestBid).toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="rounded-2xl bg-[#F8FBF8] p-3">
                    <span className="text-kicker font-bold uppercase text-[#5F6368]">{bidsCopy.openLots}</span>
                    <strong className="mt-1 block text-xl text-[#202124]">{bidInfo.summary.openLots || bidInfo.summary.lots}</strong>
                  </div>
                  <div className="rounded-2xl bg-[#F8FBF8] p-3">
                    <span className="text-kicker font-bold uppercase text-[#5F6368]">{bidsCopy.arrival}</span>
                    <strong className="mt-1 block text-xl text-[#202124]">{bidInfo.summary.totalWeightQuintal.toLocaleString('en-IN')} {bidsCopy.quintal}</strong>
                  </div>
                </div>

                <div className="mt-3 divide-y divide-[#EEF0EF] rounded-2xl border border-[#EEF0EF] bg-white/70 px-3">
                  {topBids.map((bid) => (
                    <div key={bid.lotCode} className="flex items-center justify-between gap-3 py-3 text-body">
                      <span className="min-w-0 truncate font-semibold text-[#3C4043]">{bidsCopy.lot} {bid.lotCode}</span>
                      <span className="whitespace-nowrap text-kicker font-semibold text-[#5F6368]">{bid.bags} {bidsCopy.bags}</span>
                      <strong className="whitespace-nowrap text-[#202124]">₹{Math.round(bid.maxBidValue).toLocaleString('en-IN')}</strong>
                    </div>
                  ))}
                </div>

                {closingLabel && <p className="mt-2 text-kicker font-semibold text-[#5F6368]">{bidsCopy.closes}: {closingLabel}</p>}
              </>
            )}

            {!bidLoading && !hasLiveBids && (
              <span className="mt-4 inline-flex rounded-full bg-[#F8F9FA] px-3 py-2 text-kicker font-bold text-[#5F6368]">{bidsCopy.unavailablePill}</span>
            )}
          </section>

          <section className="m3-card">
            <span className="section-kicker">{t.nearby}</span>
            <div className="mt-3 divide-y divide-[#EEF0EF]">
              {current.records.slice(0, 5).map((item, index) => (
                <div key={`${item.market}-${item.arrivalDate}-${index}`} className="flex items-center justify-between gap-3 py-3 text-body">
                  <span className="truncate text-body font-medium text-[#3C4043]">{formatLocality({ village: item.market }, lang)}</span>
                  <strong className="whitespace-nowrap text-title tabular-nums text-[#202124]">₹{Math.round(item.modalPrice).toLocaleString('en-IN')}</strong>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
