'use client';

import { useEffect, useMemo, useState } from 'react';
import { Camera, ChevronDown, Navigation, RefreshCw, Sprout } from 'lucide-react';
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
    setResetToken((value) => value + 1);
    setActiveTab('home');
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#FAFDF7]">
      <div className="flex min-h-screen w-full max-w-[480px] flex-col border-x border-[#2E7D32]/10 bg-white shadow-lg">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#2E7D32]/10 bg-[#FAFDF7]/90 px-4 py-3 backdrop-blur-md">
          <button type="button" onClick={() => setActiveTab('home')} className="flex items-center gap-2 text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8F5E9] text-[#2E7D32]"><Sprout className="h-6 w-6" /></div>
            <div><h1 className="text-xl font-extrabold tracking-tight text-[#1B1B1B]">{t.title}</h1><p className="text-[12px] font-semibold text-zinc-500">{t.tagline}</p></div>
          </button>

          <div className="flex items-center gap-2">
            <button type="button" onClick={locate} disabled={gpsStatus === 'searching'} className="flex min-h-12 min-w-12 items-center justify-center rounded-full bg-[#E8F5E9] text-[#2E7D32]" aria-label="Use GPS">
              {gpsStatus === 'searching' ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Navigation className="h-5 w-5" />}
            </button>
            <div className="relative">
              <button type="button" onClick={() => setLangMenuOpen((value) => !value)} className="flex min-h-12 items-center gap-1.5 rounded-xl border border-[#2E7D32]/10 bg-[#E8F5E9] px-3 py-2 text-sm font-bold text-[#2E7D32]">
                {LANGUAGES.find((item) => item.code === lang)?.name} <ChevronDown className="h-4 w-4" />
              </button>
              {langMenuOpen && (
                <div className="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-2xl border border-[#2E7D32]/10 bg-white shadow-xl">
                  {LANGUAGES.map((item) => <button key={item.code} type="button" onClick={() => changeLanguage(item.code)} className={`block w-full border-b border-zinc-100 px-4 py-3 text-left text-sm font-semibold last:border-0 ${lang === item.code ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'text-zinc-700'}`}>{item.name}</button>)}
                </div>
              )}
            </div>
          </div>
        </header>

        {gpsStatus === 'success' && <div className="border-b border-emerald-100 bg-emerald-50 px-4 py-2 text-center text-xs font-semibold text-[#2E7D32]">{t.gpsSuccess}: {coords.lat.toFixed(3)}, {coords.lng.toFixed(3)}</div>}
        {gpsStatus === 'error' && <div className="border-b border-rose-100 bg-rose-50 px-4 py-2 text-center text-xs font-semibold text-[#C62828]">{t.gpsDenied}</div>}

        <main className="flex-1 overflow-y-auto p-4 pb-28">
          {activeTab === 'home' && <HomeTab t={t} lang={lang} coords={coords} onAddScan={addScan} resetToken={resetToken} />}
          {activeTab === 'weather' && <WeatherTab t={t} coords={coords} />}
          {activeTab === 'mandi' && <MandiTab t={t} market={market} />}
          {activeTab === 'farm' && <FarmTab t={t} lang={lang} scans={scans} farm={{ region: farmTwin.region, farmSizeHectares: farmTwin.farmSizeHectares }} />}
        </main>

        <button type="button" onClick={openCamera} aria-label={t.takePhoto} className="m3-fab"><Camera className="h-6 w-6 text-[#1B1B1B]" /><span className="mt-0.5 text-[9px] font-black leading-none">{lang === 'en' ? 'Photo' : 'फोटो'}</span></button>
        <BottomNav activeTab={activeTab} onChange={setActiveTab} t={t} />
      </div>
    </div>
  );
}
