'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  BrainCircuit,
  Camera,
  CheckCircle2,
  ChevronDown,
  FlaskConical,
  Leaf,
  LineChart,
  Navigation,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Sprout,
  TrendingUp,
} from 'lucide-react';
import BottomNav, { type TabId } from '@/components/BottomNav';
import HomeTab, {
  type HomeTabHandle,
  type ScanHistoryItem,
} from '@/components/tabs/HomeTab';
import WeatherTab from '@/components/tabs/WeatherTab';
import MandiTab from '@/components/tabs/MandiTab';
import FarmTab from '@/components/tabs/FarmTab';
import { buildFarmIntelligence } from '@/lib/farm-intelligence';
import { LANGUAGES, TRANSLATIONS, resolveGpsMarket, resolveGpsToLanguage, type LanguageCode } from '@/lib/i18n';
import { useFarmStore } from '@/store/farmStore';
import type { WeatherForecast } from '@/types';

const DEFAULT_COORDS = { lat: 20.014, lng: 73.785 };
const SCAN_STORAGE_KEY = 'km-scans-history-v2';
const LANGUAGE_STORAGE_KEY = 'km-lang';

export default function Home() {
  const { farmTwin } = useFarmStore();
  const homeTabRef = useRef<HomeTabHandle>(null);
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [lang, setLang] = useState<LanguageCode>('hi');
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'searching' | 'success' | 'error'>('idle');
  const [coords, setCoords] = useState(DEFAULT_COORDS);
  const [scans, setScans] = useState<ScanHistoryItem[]>([]);
  const [forecast, setForecast] = useState<WeatherForecast | null>(null);
  const t = TRANSLATIONS[lang];
  const market = useMemo(() => resolveGpsMarket(coords.lat, coords.lng), [coords.lat, coords.lng]);
  const intelligence = useMemo(
    () => buildFarmIntelligence({
      coords,
      forecast,
      scans,
      farm: { region: farmTwin.region, farmSizeHectares: farmTwin.farmSizeHectares },
    }),
    [coords, farmTwin.farmSizeHectares, farmTwin.region, forecast, scans],
  );
  const topCrop = intelligence.cropRecommendations[0];

  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(console.error);
    const savedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY) as LanguageCode | null;
    if (savedLang && TRANSLATIONS[savedLang]) setLang(savedLang);
    try {
      const savedScans = JSON.parse(localStorage.getItem(SCAN_STORAGE_KEY) || '[]') as ScanHistoryItem[];
      setScans(Array.isArray(savedScans) ? savedScans.slice(0, 20) : []);
    } catch {
      setScans([]);
    }
  }, []);

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

  const changeLanguage = (next: LanguageCode) => {
    setLang(next);
    setLangMenuOpen(false);
  };

  const locate = () => {
    if (!navigator.geolocation) {
      setGpsStatus('error');
      return;
    }
    setGpsStatus('searching');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextCoords = { lat: position.coords.latitude, lng: position.coords.longitude };
        setCoords(nextCoords);
        setLang(resolveGpsToLanguage(nextCoords.lat, nextCoords.lng));
        setGpsStatus('success');
        window.setTimeout(() => setGpsStatus('idle'), 2500);
      },
      () => {
        setGpsStatus('error');
        window.setTimeout(() => setGpsStatus('idle'), 3000);
      },
      { timeout: 8000, maximumAge: 300000 },
    );
  };

  const addScan = (scan: ScanHistoryItem) => {
    setScans((current) => {
      const next = [scan, ...current].slice(0, 20);
      try {
        localStorage.setItem(SCAN_STORAGE_KEY, JSON.stringify(next));
      } catch (error) {
        console.warn('Scan history storage limit reached:', error);
        const compact = next.map((item, index) => index < 5 ? item : { ...item, thumbnail: '/placeholder-leaf.jpg' });
        localStorage.setItem(SCAN_STORAGE_KEY, JSON.stringify(compact));
        return compact;
      }
      return next;
    });
  };

  const openCamera = () => {
    setActiveTab('home');
    homeTabRef.current?.openCamera();
  };

  return (
    <div className="app-canvas flex min-h-screen flex-col items-center">
      <div className="app-shell flex min-h-screen w-full max-w-[520px] flex-col">
        <header className="premium-header sticky top-0 z-30 flex items-center justify-between px-4 py-3.5">
          <button type="button" onClick={() => setActiveTab('home')} className="flex min-w-0 items-center gap-3 text-left">
            <div className="brand-orb flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[17px] text-[#52665B]">
              <Sprout className="relative z-10 h-7 w-7" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-[22px] font-extrabold text-[#202421]">{t.title}</h1>
                <span className="hidden items-center gap-1 rounded-full border border-[#DCCBAA]/60 bg-[#FBF7EF]/90 px-2 py-0.5 text-[9px] font-black uppercase text-[#7A6645] shadow-sm sm:inline-flex">
                  <Sparkles className="h-3 w-3" /> Predict
                </span>
              </div>
              <p className="truncate text-[11px] font-semibold text-[#777B77]">{t.tagline}</p>
            </div>
          </button>

          <div className="flex flex-shrink-0 items-center gap-2">
            <button type="button" onClick={locate} disabled={gpsStatus === 'searching'} className="glass-icon-button flex min-h-12 min-w-12 items-center justify-center rounded-[17px]" aria-label="Use GPS">
              {gpsStatus === 'searching' ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Navigation className="h-5 w-5" />}
            </button>
            <div className="relative">
              <button type="button" onClick={() => setLangMenuOpen((value) => !value)} className="language-pill flex min-h-12 items-center gap-1.5 rounded-[17px] px-3 py-2 text-sm font-extrabold">
                {LANGUAGES.find((item) => item.code === lang)?.name} <ChevronDown className={`h-4 w-4 transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {langMenuOpen && (
                <div className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-[22px] border border-white/90 bg-white/95 p-1.5 shadow-[0_24px_55px_rgba(39,43,41,0.16)] backdrop-blur-xl">
                  {LANGUAGES.map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => changeLanguage(item.code)}
                      className={`block w-full rounded-2xl px-3.5 py-2.5 text-left text-sm font-bold transition-colors ${lang === item.code ? 'bg-[#F1EEE7] text-[#3D4541]' : 'text-zinc-700 hover:bg-zinc-50'}`}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {gpsStatus === 'success' && <div className="border-b border-[#D8E0E8] bg-[#F2F6FA]/90 px-4 py-2 text-center text-xs font-semibold text-[#4C6379]">{t.gpsSuccess}: {coords.lat.toFixed(3)}, {coords.lng.toFixed(3)}</div>}
        {gpsStatus === 'error' && <div className="border-b border-rose-100 bg-rose-50/90 px-4 py-2 text-center text-xs font-semibold text-[#A73C4A]">{t.gpsDenied}</div>}

        <main className="premium-main flex-1 overflow-y-auto p-4 pb-32 sm:p-5 sm:pb-32">
          <section className={activeTab === 'home' ? 'block' : 'hidden'} aria-hidden={activeTab !== 'home'}>
            <div className="space-y-5">
              <section className="m3-card bg-[#FFFDF8]">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <span className="section-kicker mb-2"><BrainCircuit className="h-3.5 w-3.5 text-[#B18C56]" /> Predictive cockpit</span>
                    <h2 className="text-[24px] font-black text-[#202421]">{intelligence.todayAction}</h2>
                    <p className="mt-2 text-sm font-semibold leading-relaxed text-[#686F69]">{intelligence.actionReason}</p>
                  </div>
                  <div className="flex h-20 w-20 flex-shrink-0 flex-col items-center justify-center rounded-[24px] border border-[#E7DDC8] bg-[#FBF6EA] shadow-sm">
                    <span className="text-[26px] font-black text-[#344039]">{intelligence.readinessScore}</span>
                    <span className="text-[10px] font-black uppercase text-[#8A7655]">score</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={openCamera} className="btn-m3-primary min-h-14 px-3 text-sm">
                    <Camera className="h-5 w-5" /> Scan crop
                  </button>
                  <button type="button" onClick={() => setActiveTab('mandi')} className="btn-m3-secondary min-h-14 px-3 text-sm">
                    <TrendingUp className="h-5 w-5" /> Market signal
                  </button>
                </div>
              </section>

              <section className="grid grid-cols-2 gap-3">
                <div className="rounded-[24px] border border-[#D9E0DB] bg-[#F5F8F5] p-4 shadow-sm">
                  <ShieldCheck className="mb-3 h-6 w-6 text-[#65776E]" />
                  <span className="block text-[11px] font-black uppercase text-[#6B756F]">Disease risk</span>
                  <strong className="mt-1 block text-lg capitalize text-[#27302B]">{intelligence.diseaseRisk}</strong>
                </div>
                <div className="rounded-[24px] border border-[#E6D9BE] bg-[#FCF7EC] p-4 shadow-sm">
                  <LineChart className="mb-3 h-6 w-6 text-[#A4824F]" />
                  <span className="block text-[11px] font-black uppercase text-[#8A7655]">Mandi area</span>
                  <strong className="mt-1 block text-lg text-[#3E382E]">{market.district}</strong>
                </div>
              </section>

              <section className="m3-card space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="section-kicker"><AlertTriangle className="h-3.5 w-3.5 text-[#B18C56]" /> Prevent loss</span>
                  <span className="metric-pill">{forecast?.dataSource ?? 'loading'}</span>
                </div>
                {intelligence.preventiveAlerts.map((alert) => (
                  <div key={alert.title} className={`rounded-2xl border p-3 text-sm font-bold ${alert.tone === 'danger' ? 'border-rose-200 bg-rose-50 text-rose-800' : alert.tone === 'watch' ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-[#D9E0DB] bg-[#F5F8F5] text-[#52665B]'}`}>
                    <div className="mb-1 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> {alert.title}</div>
                    <p className="font-semibold leading-relaxed opacity-90">{alert.detail}</p>
                  </div>
                ))}
              </section>

              <section className="m3-card space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="section-kicker"><Leaf className="h-3.5 w-3.5 text-[#65776E]" /> Crop selection</span>
                  <span className="metric-pill">Top: {topCrop.score}/100</span>
                </div>
                {intelligence.cropRecommendations.slice(0, 3).map((crop) => (
                  <div key={crop.crop} className="rounded-2xl border border-zinc-100 bg-[#FAFAF8] p-3">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-[16px] font-black text-[#242824]">{crop.localName}</h3>
                        <p className="text-xs font-bold text-zinc-500">{crop.season} · {crop.waterNeed} water</p>
                      </div>
                      <span className="rounded-full bg-[#303733] px-3 py-1 text-xs font-black text-white">{crop.score}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {crop.reasons.map((reason) => <span key={reason} className="rounded-full border border-[#E4DCCB] bg-white px-2.5 py-1 text-[11px] font-bold text-[#6D614B]">{reason}</span>)}
                    </div>
                  </div>
                ))}
              </section>

              <section className="m3-card space-y-3">
                <span className="section-kicker"><FlaskConical className="h-3.5 w-3.5 text-[#A84450]" /> Fertilizer selection</span>
                <h3 className="text-xl font-black text-[#242824]">{intelligence.fertilizerPlan.crop}</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[#DCE3DE] bg-[#F6F8F6] p-3">
                    <span className="block text-[11px] font-black uppercase text-[#5D6B63]">Organic first</span>
                    <p className="mt-1 text-sm font-bold text-[#4F5D55]">{intelligence.fertilizerPlan.organic}</p>
                  </div>
                  <div className="rounded-2xl border border-rose-100 bg-[#FFF8F8] p-3">
                    <span className="block text-[11px] font-black uppercase text-rose-700">Mineral category</span>
                    <p className="mt-1 text-sm font-bold text-[#A84450]">{intelligence.fertilizerPlan.mineralCategory}</p>
                  </div>
                </div>
                <p className="rounded-2xl border border-[#E4D4B4] bg-[#FBF6EC] p-3 text-sm font-bold text-zinc-700">{intelligence.fertilizerPlan.timing} {intelligence.fertilizerPlan.safety}</p>
              </section>

              <section className="m3-card space-y-3">
                <span className="section-kicker"><BookOpen className="h-3.5 w-3.5 text-[#61788D]" /> Guidance and education</span>
                {intelligence.educationCards.map((card) => (
                  <div key={card.title} className="rounded-2xl border border-zinc-100 bg-white p-3">
                    <h3 className="text-sm font-black text-[#252925]">{card.title}</h3>
                    <p className="mt-1 text-sm font-semibold leading-relaxed text-zinc-600">{card.lesson}</p>
                    <p className="mt-2 text-xs font-black text-[#6F5D3E]">Action: {card.action}</p>
                  </div>
                ))}
              </section>

              <HomeTab ref={homeTabRef} t={t} lang={lang} coords={coords} onAddScan={addScan} />
            </div>
          </section>
          <section className={activeTab === 'weather' ? 'block' : 'hidden'} aria-hidden={activeTab !== 'weather'}>
            <WeatherTab t={t} coords={coords} />
          </section>
          <section className={activeTab === 'mandi' ? 'block' : 'hidden'} aria-hidden={activeTab !== 'mandi'}>
            <MandiTab t={t} market={market} />
          </section>
          <section className={activeTab === 'farm' ? 'block' : 'hidden'} aria-hidden={activeTab !== 'farm'}>
            <FarmTab t={t} lang={lang} scans={scans} farm={{ region: farmTwin.region, farmSizeHectares: farmTwin.farmSizeHectares }} />
          </section>
        </main>

        <button type="button" onClick={openCamera} aria-label={t.takePhoto} className="m3-fab">
          <Camera className="h-6 w-6 text-[#373D39]" />
          <span className="mt-0.5 text-[9px] font-black leading-none text-[#4B514D]">{lang === 'en' ? 'Photo' : 'फोटो'}</span>
        </button>
        <BottomNav activeTab={activeTab} onChange={setActiveTab} t={t} />
      </div>
    </div>
  );
}
