'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Leaf,
  MapPin,
  Navigation,
  RefreshCw,
  Sprout,
  TrendingUp,
} from 'lucide-react';
import BottomNav, { type TabId } from '@/components/BottomNav';
import FieldPlanner from '@/components/FieldPlanner';
import HomeTab, { type ScanHistoryItem } from '@/components/tabs/HomeTab';
import WeatherTab from '@/components/tabs/WeatherTab';
import MandiTab from '@/components/tabs/MandiTab';
import FarmTab from '@/components/tabs/FarmTab';
import { buildFarmIntelligence } from '@/lib/farm-intelligence';
import { readAuthSession } from '@/lib/auth-session';
import { LANGUAGES, TRANSLATIONS, resolveGpsMarket, resolveGpsToLanguage, type LanguageCode } from '@/lib/i18n';
import { useFarmStore } from '@/store/farmStore';
import type { WeatherForecast } from '@/types';

const DEFAULT_COORDS = { lat: 20.014, lng: 73.785 };
const SCAN_STORAGE_KEY = 'km-scans-history-v2';
const LANGUAGE_STORAGE_KEY = 'km-lang';
function readSavedLanguage(): LanguageCode {
  if (typeof window === 'undefined') return 'hi';
  const savedLang = window.localStorage.getItem(LANGUAGE_STORAGE_KEY) as LanguageCode | null;
  return savedLang && TRANSLATIONS[savedLang] ? savedLang : 'hi';
}
function readSavedScans(): ScanHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const savedScans = JSON.parse(window.localStorage.getItem(SCAN_STORAGE_KEY) || '[]') as ScanHistoryItem[];
    return Array.isArray(savedScans) ? savedScans.slice(0, 20) : [];
  } catch {
    return [];
  }
}

export default function Dashboard() {
  const router = useRouter();
  const { farmTwin } = useFarmStore();
  const [authReady, setAuthReady] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [lang, setLang] = useState<LanguageCode>('hi');
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'searching' | 'success' | 'error'>('idle');
  const [coords, setCoords] = useState(DEFAULT_COORDS);
  const [scans, setScans] = useState<ScanHistoryItem[]>([]);
  const [forecast, setForecast] = useState<WeatherForecast | null>(null);
  const [place, setPlace] = useState({ village: 'Nashik', district: 'Nashik', state: 'Maharashtra', source: 'fallback' });

  const t = TRANSLATIONS[lang];
  const market = useMemo(() => resolveGpsMarket(coords.lat, coords.lng), [coords.lat, coords.lng]);
  const intelligence = useMemo(
    () => buildFarmIntelligence({
      coords,
      forecast,
      scans,
      farm: { region: farmTwin.region, farmSizeHectares: farmTwin.farmSizeHectares },
      lang,
    }),
    [coords, farmTwin.farmSizeHectares, farmTwin.region, forecast, lang, scans],
  );

  const topAlert = intelligence.preventiveAlerts[0];
  const topCrop = intelligence.cropRecommendations[0];

  useEffect(() => {
    const session = readAuthSession();
    if (!session) {
      router.replace('/');
      return undefined;
    }

    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(console.error);
    const storageTimer = window.setTimeout(() => {
      setLang(session.language && TRANSLATIONS[session.language] ? session.language : readSavedLanguage());
      setScans(readSavedScans());
      setAuthReady(true);
    }, 0);
    return () => window.clearTimeout(storageTimer);
  }, [router]);

  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  }, [lang]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/weather?lat=${coords.lat}&lng=${coords.lng}`, { signal: controller.signal })
      .then((response) => response.json())
      .then((payload: WeatherForecast) => setForecast(payload))
      .catch(() => setForecast(null));
    return () => controller.abort();
  }, [coords.lat, coords.lng]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/location/reverse?lat=${coords.lat}&lng=${coords.lng}&fallback=${encodeURIComponent(market.district)}`, { signal: controller.signal })
      .then((response) => response.json())
      .then((payload) => setPlace(payload))
      .catch(() => setPlace({ village: market.district, district: market.district, state: market.state, source: 'fallback' }));
    return () => controller.abort();
  }, [coords.lat, coords.lng, market.district, market.state]);

  const locate = () => {
    if (!navigator.geolocation) return setGpsStatus('error');
    setGpsStatus('searching');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = { lat: position.coords.latitude, lng: position.coords.longitude };
        setCoords(next);
        setLang(resolveGpsToLanguage(next.lat, next.lng));
        setGpsStatus('success');
        window.setTimeout(() => setGpsStatus('idle'), 2200);
      },
      () => {
        setGpsStatus('error');
        window.setTimeout(() => setGpsStatus('idle'), 2600);
      },
      { timeout: 8000, maximumAge: 300000 },
    );
  };

  if (!authReady) {
    return (
      <div className="app-canvas flex min-h-screen items-center justify-center p-4">
        <div className="m3-card max-w-sm text-center text-sm font-bold text-[#3C4043]">{t.loading}</div>
      </div>
    );
  }

  const addScan = (scan: ScanHistoryItem) => {
    setScans((current) => {
      const next = [scan, ...current].slice(0, 20);
      try {
        localStorage.setItem(SCAN_STORAGE_KEY, JSON.stringify(next));
        return next;
      } catch {
        const compact = next.map((item, index) => index < 5 ? item : { ...item, thumbnail: '/placeholder-leaf.jpg' });
        localStorage.setItem(SCAN_STORAGE_KEY, JSON.stringify(compact));
        return compact;
      }
    });
  };

  return (
    <div className="app-canvas flex min-h-screen flex-col items-center">
      <div className="app-shell flex min-h-screen w-full max-w-[1180px] flex-col">
        <header className="premium-header sticky top-0 z-30 flex items-center justify-between px-4 py-3">
          <button type="button" onClick={() => setActiveTab('home')} className="flex min-w-0 items-center gap-2.5 text-left">
            <div className="brand-orb flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl text-[#1F6B4F]">
              <Sprout className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-[19px] font-bold tracking-[-0.02em] text-[#202124]">{t.title}</h1>
              <p className="truncate text-[11px] font-medium text-[#6F7478]">{place.village}</p>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <button type="button" onClick={locate} disabled={gpsStatus === 'searching'} className="glass-icon-button flex h-10 w-10 items-center justify-center rounded-full" aria-label="Use GPS">
              {gpsStatus === 'searching' ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
            </button>
            <div className="relative">
              <button type="button" onClick={() => setLangMenuOpen((value) => !value)} className="language-pill flex h-10 items-center gap-1 rounded-full px-3 text-xs font-semibold">
                {LANGUAGES.find((item) => item.code === lang)?.name}<ChevronDown className="h-3.5 w-3.5" />
              </button>
              {langMenuOpen && (
                <div className="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-2xl border border-[#E4E7E5] bg-white p-1.5 shadow-xl">
                  {LANGUAGES.map((item) => (
                    <button key={item.code} type="button" onClick={() => { setLang(item.code); setLangMenuOpen(false); }} className={`block w-full rounded-xl px-3 py-2 text-left text-sm font-medium ${lang === item.code ? 'bg-[#E8F0FE] text-[#1967D2]' : 'text-[#3C4043] hover:bg-[#F1F3F4]'}`}>
                      {item.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {gpsStatus === 'success' && <div className="status-strip">{t.locationUpdated}</div>}
        {gpsStatus === 'error' && <div className="status-strip status-strip-error">{t.locationUnavailable}</div>}

        <main className="premium-main flex-1 overflow-y-auto p-4 pb-28 sm:p-6 sm:pb-28">
          <section className={activeTab === 'home' ? 'block' : 'hidden'} aria-hidden={activeTab !== 'home'}>
            <div className="google-home-grid">
              <section className="m3-card google-hero">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <span className="section-kicker">{t.today}</span>
                    <h2 className="mt-2 text-[24px] font-bold text-[#202124]">{intelligence.todayAction}</h2>
                    <p className="mt-2 line-clamp-2 text-sm font-medium text-[#5F6368]">{intelligence.actionReason}</p>
                  </div>
                  <div className="score-chip"><strong>{intelligence.readinessScore}</strong><span>{t.score}</span></div>
                </div>
              </section>

              <div className="google-action-grid">
                <button type="button" onClick={() => setActiveTab('weather')} className="google-action-card">
                  <span className="google-icon google-icon-amber"><AlertTriangle className="h-5 w-5" /></span>
                  <span><small>{t.alerts}</small><strong>{topAlert?.title || t.noMajorRisk}</strong></span>
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setActiveTab('mandi')} className="google-action-card">
                  <span className="google-icon google-icon-blue"><TrendingUp className="h-5 w-5" /></span>
                  <span><small>{t.mandi}</small><strong>{market.district}</strong></span>
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setActiveTab('farm')} className="google-action-card">
                  <span className="google-icon google-icon-green"><Leaf className="h-5 w-5" /></span>
                  <span><small>{t.bestCrop}</small><strong>{topCrop?.localName || t.addFarmData}</strong></span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <section className="m3-card fertiliser-card">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <span className="section-kicker">{t.fertilizerPlan}</span>
                    <h3 className="mt-2 text-lg font-black text-[#202124]">{intelligence.fertilizerPlan.crop}</h3>
                    <p className="mt-2 text-sm font-semibold leading-relaxed text-[#4F5B54]">{intelligence.fertilizerPlan.priority}</p>
                  </div>
                  <span className="google-icon google-icon-green"><Leaf className="h-5 w-5" /></span>
                </div>
                <div className="mt-3 grid gap-2 text-xs font-bold text-[#526058] sm:grid-cols-2">
                  <p className="rounded-2xl bg-[#F4FAF6] p-3">{t.mineral}: {intelligence.fertilizerPlan.mineralCategory}</p>
                  <p className="rounded-2xl bg-[#FFF8EA] p-3">{t.timing}: {intelligence.fertilizerPlan.timing}</p>
                </div>
                <p className="mt-3 text-[11px] font-bold leading-relaxed text-[#6A756F]">{intelligence.fertilizerPlan.safety}</p>
              </section>

              <div className="scan-zone">
                <HomeTab t={t} lang={lang} coords={coords} onAddScan={addScan} />
              </div>

              <details className="m3-card clean-details">
                <summary><span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {t.farmPlan}</span><ChevronDown className="h-4 w-4" /></summary>
                <div className="mt-4"><FieldPlanner coords={coords} market={market} /></div>
              </details>
            </div>
          </section>

          <section className={activeTab === 'weather' ? 'block' : 'hidden'} aria-hidden={activeTab !== 'weather'}><WeatherTab t={t} lang={lang} coords={coords} /></section>
          <section className={activeTab === 'mandi' ? 'block' : 'hidden'} aria-hidden={activeTab !== 'mandi'}><MandiTab t={t} lang={lang} market={{ ...market, village: place.village }} /></section>
          <section className={activeTab === 'farm' ? 'block' : 'hidden'} aria-hidden={activeTab !== 'farm'}><FarmTab t={t} lang={lang} scans={scans} farm={{ region: farmTwin.region, farmSizeHectares: farmTwin.farmSizeHectares }} /></section>
        </main>

        <BottomNav activeTab={activeTab} onChange={setActiveTab} t={t} />
      </div>
    </div>
  );
}
