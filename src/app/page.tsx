'use client';

import { useEffect, useMemo, useState } from 'react';
import { Camera, ChevronDown, Navigation, RefreshCw, Sparkles, Sprout } from 'lucide-react';
import BottomNav, { type TabId } from '@/components/BottomNav';
import HomeTab, { type ScanHistoryItem } from '@/components/tabs/HomeTab';
import WeatherTab from '@/components/tabs/WeatherTab';
import MandiTab from '@/components/tabs/MandiTab';
import FarmTab from '@/components/tabs/FarmTab';
import { LANGUAGES, TRANSLATIONS, resolveGpsMarket, resolveGpsToLanguage, type LanguageCode } from '@/lib/i18n';
import { useFarmStore } from '@/store/farmStore';

const DEFAULT_COORDS = { lat: 20.014, lng: 73.785 };
const SCAN_STORAGE_KEY = 'km-scans-history-v2';
const LANGUAGE_STORAGE_KEY = 'km-lang';

export default function Home() {
  const { farmTwin } = useFarmStore();
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [lang, setLang] = useState<LanguageCode>('hi');
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'searching' | 'success' | 'error'>('idle');
  const [coords, setCoords] = useState(DEFAULT_COORDS);
  const [scans, setScans] = useState<ScanHistoryItem[]>([]);
  const [resetToken, setResetToken] = useState(0);
  const t = TRANSLATIONS[lang];
  const market = useMemo(() => resolveGpsMarket(coords.lat, coords.lng), [coords.lat, coords.lng]);

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
    setResetToken((value) => value + 1);
  };

  return (
    <div className="app-canvas flex min-h-screen flex-col items-center">
      <div className="app-shell flex min-h-screen w-full max-w-[520px] flex-col">
        <header className="premium-header sticky top-0 z-30 flex items-center justify-between px-4 py-3.5">
          <button type="button" onClick={() => setActiveTab('home')} className="flex min-w-0 items-center gap-3 text-left">
            <div className="brand-orb flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[17px] text-[#2E7D32]">
              <Sprout className="relative z-10 h-7 w-7" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-[22px] font-extrabold tracking-[-0.035em] text-[#171A18]">{t.title}</h1>
                <span className="hidden items-center gap-1 rounded-full border border-emerald-100 bg-white/75 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-emerald-700 shadow-sm sm:inline-flex">
                  <Sparkles className="h-3 w-3" /> AI
                </span>
              </div>
              <p className="truncate text-[11px] font-semibold text-zinc-500">{t.tagline}</p>
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
                <div className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-[22px] border border-white/90 bg-white/95 p-1.5 shadow-[0_24px_55px_rgba(28,78,36,0.18)] backdrop-blur-xl">
                  {LANGUAGES.map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => changeLanguage(item.code)}
                      className={`block w-full rounded-2xl px-3.5 py-2.5 text-left text-sm font-bold transition-colors ${lang === item.code ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'text-zinc-700 hover:bg-zinc-50'}`}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {gpsStatus === 'success' && <div className="border-b border-emerald-100 bg-emerald-50/85 px-4 py-2 text-center text-xs font-semibold text-[#2E7D32]">{t.gpsSuccess}: {coords.lat.toFixed(3)}, {coords.lng.toFixed(3)}</div>}
        {gpsStatus === 'error' && <div className="border-b border-rose-100 bg-rose-50/90 px-4 py-2 text-center text-xs font-semibold text-[#C62828]">{t.gpsDenied}</div>}

        <main className="premium-main flex-1 overflow-y-auto p-4 pb-32 sm:p-5 sm:pb-32">
          {activeTab === 'home' && <HomeTab t={t} lang={lang} coords={coords} onAddScan={addScan} resetToken={resetToken} />}
          {activeTab === 'weather' && <WeatherTab t={t} coords={coords} />}
          {activeTab === 'mandi' && <MandiTab t={t} market={market} />}
          {activeTab === 'farm' && <FarmTab t={t} lang={lang} scans={scans} farm={{ region: farmTwin.region, farmSizeHectares: farmTwin.farmSizeHectares }} />}
        </main>

        <button type="button" onClick={openCamera} aria-label={t.takePhoto} className="m3-fab">
          <Camera className="h-6 w-6 text-[#263429]" />
          <span className="mt-0.5 text-[9px] font-black leading-none text-[#39443B]">{lang === 'en' ? 'Photo' : 'फोटो'}</span>
        </button>
        <BottomNav activeTab={activeTab} onChange={setActiveTab} t={t} />
      </div>
    </div>
  );
}
