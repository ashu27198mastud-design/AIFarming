'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  BarChart3,
  CalendarCheck,
  ChevronDown,
  ChevronRight,
  CloudRain,
  MapPin,
  Navigation,
  RefreshCw,
  ShieldCheck,
  Sprout,
  ThermometerSun,
  Wind,
} from 'lucide-react';
import BottomNav, { type TabId } from '@/components/BottomNav';
import LatinLeakScanner from '@/components/LatinLeakScanner';
import ScoreRing from '@/components/ScoreRing';
import FertilizerGapCard from '@/components/FertilizerGapCard';
import FieldPlanner from '@/components/FieldPlanner';
import CommerceHub from '@/components/CommerceHub';
import HomeTab, { type ScanHistoryItem } from '@/components/tabs/HomeTab';
import WeatherTab from '@/components/tabs/WeatherTab';
import MandiTab from '@/components/tabs/MandiTab';
import FarmTab from '@/components/tabs/FarmTab';
import { buildFarmIntelligence } from '@/lib/farm-intelligence';
import { readAuthSession } from '@/lib/auth-session';
import { formatLocality, formatMarketName } from '@/lib/locality';
import { LANGUAGES, TRANSLATIONS, resolveGpsMarket, resolveGpsToLanguage, type LanguageCode } from '@/lib/i18n';
import { useFarmStore } from '@/store/farmStore';
import type { WeatherForecast } from '@/types';

const DEFAULT_COORDS = { lat: 20.014, lng: 73.785 };
const SCAN_STORAGE_KEY = 'km-scans-history-v2';
const LANGUAGE_STORAGE_KEY = 'km-lang';

const DASHBOARD_COPY: Record<LanguageCode, {
  safeWindow: string;
  safeOn: string;
  noSafeWindow: string;
  viewForecast: string;
  scoreBasis: string;
  weatherSafety: string;
  cropFit: string;
  dataCoverage: string;
  complete: string;
  nearestMarket: string;
  locationBased: string;
  distance: string;
  cropOpportunity: string;
  compareMarkets: string;
  live: string;
  rising: string;
  stable: string;
  watch: string;
}> = {
  hi: {
    safeWindow: 'अगली सुरक्षित कार्य अवधि',
    safeOn: 'सुरक्षित दिन',
    noSafeWindow: 'अगले 7 दिनों में सुरक्षित अवधि नहीं',
    viewForecast: 'पूरा पूर्वानुमान देखें',
    scoreBasis: 'मौसम, फसल और खेत डेटा पर आधारित',
    weatherSafety: 'मौसम सुरक्षा',
    cropFit: 'फसल अनुकूलता',
    dataCoverage: '7 दिन का पूर्वानुमान',
    complete: 'पूरा',
    nearestMarket: 'जिला APMC',
    locationBased: 'जीपीएस अनुमान',
    distance: 'दूरी',
    cropOpportunity: 'फसल अवसर',
    compareMarkets: 'मंडियों की तुलना करें',
    live: 'लाइव',
    rising: 'बढ़ता',
    stable: 'स्थिर',
    watch: 'नज़र रखें',
  },
  en: {
    safeWindow: 'Next safe work window',
    safeOn: 'Safe day',
    noSafeWindow: 'No safe window in the next 7 days',
    viewForecast: 'View full forecast',
    scoreBasis: 'Based on weather, crop, and farm data',
    weatherSafety: 'Weather safety',
    cropFit: 'Crop fit',
    dataCoverage: '7-day forecast',
    complete: 'Complete',
    nearestMarket: 'District APMC',
    locationBased: 'GPS estimate',
    distance: 'Distance',
    cropOpportunity: 'Crop opportunity',
    compareMarkets: 'Compare markets',
    live: 'Live',
    rising: 'Rising',
    stable: 'Stable',
    watch: 'Watch',
  },
  mr: {
    safeWindow: 'पुढील सुरक्षित कामाची वेळ',
    safeOn: 'सुरक्षित दिवस',
    noSafeWindow: 'पुढील ७ दिवसांत सुरक्षित वेळ नाही',
    viewForecast: 'पूर्ण हवामान पहा',
    scoreBasis: 'हवामान, पीक आणि शेत डेटावर आधारित',
    weatherSafety: 'हवामान सुरक्षा',
    cropFit: 'पीक अनुकूलता',
    dataCoverage: '७ दिवसांचा अंदाज',
    complete: 'पूर्ण',
    nearestMarket: 'जिल्हा APMC',
    locationBased: 'जीपीएस अंदाज',
    distance: 'अंतर',
    cropOpportunity: 'पीक संधी',
    compareMarkets: 'मंड्यांची तुलना करा',
    live: 'थेट',
    rising: 'वाढता',
    stable: 'स्थिर',
    watch: 'लक्ष ठेवा',
  },
};
function readSavedLanguage(fallback: LanguageCode = 'hi'): LanguageCode {
  if (typeof window === 'undefined') return fallback;
  const savedLang = window.localStorage.getItem(LANGUAGE_STORAGE_KEY) as LanguageCode | null;
  return savedLang && TRANSLATIONS[savedLang] ? savedLang : fallback;
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
  const [userName, setUserName] = useState('Asha Pawar');
  const [lang, setLang] = useState<LanguageCode>('hi');
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'searching' | 'success' | 'error'>('idle');
  const [coords, setCoords] = useState(DEFAULT_COORDS);
  const [scans, setScans] = useState<ScanHistoryItem[]>([]);
  const [forecast, setForecast] = useState<WeatherForecast | null>(null);
  const [theme, setTheme] = useState('theme-day');
  const [place, setPlace] = useState({ village: 'Nashik', district: 'Nashik', state: 'Maharashtra', source: 'fallback' });
  const [apmcDirectory, setApmcDirectory] = useState<{ name: string; dataSource: 'live' | 'fallback' }>({ name: '', dataSource: 'fallback' });

  useEffect(() => {
    const updateTheme = () => {
      const hour = new Date().getHours();
      if (hour >= 4 && hour < 7) setTheme('theme-dawn');
      else if (hour >= 7 && hour < 17) setTheme('theme-day');
      else if (hour >= 17 && hour < 20) setTheme('theme-dusk');
      else setTheme('theme-night');
    };
    updateTheme();
    const interval = setInterval(updateTheme, 60000);
    return () => clearInterval(interval);
  }, []);

  const t = TRANSLATIONS[lang];
  const market = useMemo(() => resolveGpsMarket(coords.lat, coords.lng), [coords.lat, coords.lng]);
  const resolvedDistrict = place.district.replace(/\s+District$/i, '').trim() || market.district;
  const displayLocality = formatLocality(place, lang);
  const displayDistrict = formatLocality({ village: resolvedDistrict, district: market.district, state: place.state }, lang);
  const intelligence = useMemo(
    () => buildFarmIntelligence({
      coords,
      forecast,
      scans,
      farm: { region: displayDistrict || farmTwin.region, farmSizeHectares: farmTwin.farmSizeHectares },
      lang,
    }),
    [coords, displayDistrict, farmTwin.farmSizeHectares, farmTwin.region, forecast, lang, scans],
  );

  const topAlert = intelligence.preventiveAlerts[0];
  const topCrop = intelligence.cropRecommendations[0];

  useEffect(() => {
    const session = readAuthSession();
    if (!session) {
      router.replace('/');
      return undefined;
    }
    if (!session.setupCompleted) {
      router.replace('/setup');
      return undefined;
    }

    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(console.error);
    const storageTimer = window.setTimeout(() => {
      setLang(readSavedLanguage(session.language && TRANSLATIONS[session.language] ? session.language : 'hi'));
      setUserName(session.name || 'Kisan');
      setScans(readSavedScans());
      if (session.coords) {
        setCoords(session.coords);
      }
      if (session.village) {
        setPlace({
          village: session.village,
          district: session.village,
          state: 'Maharashtra',
          source: 'session',
        });
      }
      setAuthReady(true);
    }, 0);
    return () => window.clearTimeout(storageTimer);
  }, [router]);

  useEffect(() => {
    document.documentElement.lang = lang;
    if (authReady) localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  }, [authReady, lang]);

  useEffect(() => {
    if (!authReady) return undefined;
    const controller = new AbortController();
    fetch(`/api/weather?lat=${coords.lat}&lng=${coords.lng}`, { signal: controller.signal })
      .then((response) => response.json())
      .then((payload: WeatherForecast) => setForecast(payload))
      .catch(() => setForecast(null));
    return () => controller.abort();
  }, [coords.lat, coords.lng, authReady]);

  useEffect(() => {
    if (!authReady) return undefined;
    const controller = new AbortController();
    fetch(`/api/location/reverse?lat=${coords.lat}&lng=${coords.lng}&fallback=${encodeURIComponent(market.district)}&language=${lang}`, { signal: controller.signal })
      .then((response) => response.json())
      .then((payload) => {
        const session = readAuthSession();
        if (session?.village && session.coords && Math.abs(coords.lat - session.coords.lat) < 0.0001 && Math.abs(coords.lng - session.coords.lng) < 0.0001) {
          setPlace({ ...payload, village: session.village });
        } else {
          setPlace(payload);
        }
      })
      .catch(() => setPlace({ village: market.district, district: market.district, state: market.state, source: 'fallback' }));
    return () => controller.abort();
  }, [coords.lat, coords.lng, authReady, lang, market.district, market.state]);

  useEffect(() => {
    if (!authReady || !market.state || !market.district) return undefined;
    const controller = new AbortController();
    const params = new URLSearchParams({
      state: market.state,
      district: market.district,
      language: lang,
    });
    fetch('/api/apmc?' + params.toString(), { signal: controller.signal })
      .then((response) => response.json())
      .then((payload: { apmcs?: Array<{ name: string }>; dataSource?: 'live' | 'fallback' }) => {
        const first = payload.apmcs?.[0];
        setApmcDirectory({
          name: first?.name || market.district + ' APMC',
          dataSource: first ? 'live' : 'fallback',
        });
      })
      .catch(() => setApmcDirectory({ name: market.district + ' APMC', dataSource: 'fallback' }));
    return () => controller.abort();
  }, [authReady, lang, market.district, market.state]);
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
      <div className={`living-field-root ${theme} flex min-h-screen items-center justify-center p-4`}>
        <div className="m3-card max-w-sm text-center text-sm font-bold text-[var(--lf-ink)]">{t.loading}</div>
      </div>
    );
  }

  const currentWeather = forecast?.hourly?.[0];
  const dashboardCopy = DASHBOARD_COPY[lang];
  const displayedScore = forecast ? intelligence.readinessScore : null;
  const activeSectionLabel = activeTab === 'weather' ? t.weather : activeTab === 'mandi' ? t.mandi : activeTab === 'farm' ? t.myFarm : activeTab === 'tools' ? t.farmPlan : activeTab === 'commerce' ? (lang === 'en' ? 'Seller hub' : lang === 'hi' ? 'बिक्री केंद्र' : 'विक्री केंद्र') : t.home;
  const outlookLocale = lang === 'mr' ? 'mr-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
  const outlookData = (forecast?.daily ?? []).slice(0, 7).map((day) => ({
    day: new Intl.DateTimeFormat(outlookLocale, { weekday: 'short' }).format(new Date(day.date + 'T00:00:00')),
    rainMm: Number(day.precipMm.toFixed(1)),
    rainChance: Math.round(day.precipProbability),
    temp: Math.round(day.maxTempC),
    wind: Math.round(day.windSpeedKmh),
    safe: day.precipProbability < 35 && day.windSpeedKmh < 16,
  }));
  const safeDay = outlookData.find((day) => day.safe);
  const marketSignal = topCrop?.profitSignal ?? 'watch';
  const marketSignalLabel = dashboardCopy[marketSignal];
  const marketName = formatMarketName(apmcDirectory.name || market.district + ' APMC', { district: market.district, state: market.state }, lang);
  const commandCards = [
    {
      key: 'weather',
      label: t.weather,
      title: topAlert?.title || t.noMajorWeatherRisk,
      detail: topAlert?.detail || intelligence.actionReason,
      icon: ShieldCheck,
      tone: topAlert?.tone === 'danger' ? 'danger' : topAlert?.tone === 'watch' ? 'watch' : 'good',
    },
    {
      key: 'crop',
      label: t.bestCrop,
      title: topCrop?.localName || t.addFarmData,
      detail: topCrop ? topCrop.reasons[0] : intelligence.actionReason,
      icon: CalendarCheck,
      tone: 'good',
    },
    {
      key: 'market',
      label: t.mandi,
      title: marketName,
      detail: apmcDirectory.dataSource === 'live' ? dashboardCopy.live : dashboardCopy.locationBased + ' · ~' + market.distanceKm + ' km',
      icon: BarChart3,
      tone: 'watch',
    },
  ];

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
    <div className={`living-field-root ${theme} flex min-h-screen flex-col items-center`}>
      <LatinLeakScanner locale={lang} />
      <div className="living-field-sky-glow" aria-hidden="true" />
      <div className="app-shell relative z-10 flex min-h-screen w-full max-w-none flex-col">
        <header className="premium-header sticky top-0 z-30 flex items-center justify-between px-4 py-3">
          <div className="desktop-header-context">
            <strong>{activeSectionLabel}</strong>
            <span>{displayLocality}</span>
          </div>
          <button type="button" onClick={() => setActiveTab('home')} className="premium-header-brand flex min-w-0 items-center gap-2.5 text-left">
            <div className="brand-orb flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl text-[#1F6B4F]">
              <Sprout className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-[19px] font-bold tracking-[-0.02em] text-[var(--lf-ink)]">{t.title}</h1>
              <p className="truncate text-[11px] font-medium text-[#6F7478]">{displayLocality}</p>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <button type="button" onClick={locate} disabled={gpsStatus === 'searching'} className="glass-icon-button flex h-10 w-10 items-center justify-center rounded-full" aria-label="Use GPS">
              {gpsStatus === 'searching' ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
            </button>
            <div className="language-select-wrap">
              <select
                value={lang}
                onChange={(event) => setLang(event.target.value as LanguageCode)}
                className="language-pill h-10 appearance-none rounded-full py-0 pl-3 pr-8 text-xs font-semibold"
                aria-label="Language"
              >
                {LANGUAGES.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
              </select>
              <ChevronDown className="language-select-icon h-3.5 w-3.5" aria-hidden="true" />
            </div>
          </div>
        </header>

        {gpsStatus === 'success' && <div className="status-strip">{t.locationUpdated}</div>}
        {gpsStatus === 'error' && <div className="status-strip status-strip-error">{t.locationUnavailable}</div>}

        <main className="premium-main flex-1 overflow-y-auto p-4 pb-28 sm:p-6 sm:pb-28">
          <section className={activeTab === 'home' ? 'block' : 'hidden'} aria-hidden={activeTab !== 'home'}>
            <div className="farm-ops-grid">
              <section className="ops-decision-panel premium-glass-card premium-glass-card-raised" aria-labelledby="dashboard-heading">
                <div className="ops-decision-main">
                  <div className="ops-decision-copy">
                    <span className="ops-eyebrow"><Sprout className="h-3.5 w-3.5" /> {t.today} - {displayLocality}</span>
                    <h2 id="dashboard-heading">{intelligence.todayAction}</h2>
                    <p>{intelligence.actionReason}</p>
                  </div>
                  <aside className={!outlookData.length ? 'ops-safe-window ops-safe-window-pending' : safeDay ? 'ops-safe-window' : 'ops-safe-window ops-safe-window-risk'}>
                    <span><CalendarCheck className="h-4 w-4" /> {dashboardCopy.safeWindow}</span>
                    <strong>{!outlookData.length ? t.loading : safeDay ? dashboardCopy.safeOn + ': ' + safeDay.day : dashboardCopy.noSafeWindow}</strong>
                    <p><CloudRain className="h-3.5 w-3.5" /> {currentWeather ? Math.round(currentWeather.precipProbability) + '%' : '--'} <Wind className="h-3.5 w-3.5" /> {currentWeather ? Math.round(currentWeather.windSpeedKmh) + ' km/h' : '--'}</p>
                    <button type="button" onClick={() => setActiveTab('weather')}>{dashboardCopy.viewForecast}<ChevronRight className="h-4 w-4" /></button>
                  </aside>
                </div>
                <div className="ops-signal-row">
                  {commandCards.map((item) => {
                    const CommandIcon = item.icon;
                    const destination = item.key === 'weather' ? 'weather' : item.key === 'market' ? 'mandi' : item.key === 'crop' ? 'tools' : 'farm';
                    return (
                      <button key={item.key} type="button" onClick={() => setActiveTab(destination)} className={'ops-signal ops-signal-' + item.tone}>
                        <span className="ops-signal-icon"><CommandIcon className="h-4 w-4" /></span>
                        <span><small>{item.label}</small><strong>{item.title}</strong><em>{item.detail}</em></span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    );
                  })}
                </div>
              </section>

              <aside className="ops-readiness-panel premium-glass-card premium-glass-card-raised" aria-label={t.score}>
                <div className="ops-panel-heading">
                  <span><Activity className="h-4 w-4" /> {t.myFarm}</span>
                  <small>{displayLocality}</small>
                </div>
                <div className="ops-readiness-body">
                  <ScoreRing score={displayedScore} t={t} />
                  <div className="ops-readiness-metrics">
                    <div><ThermometerSun className="h-4 w-4" /><span><small>{t.weather}</small><strong>{currentWeather ? Math.round(currentWeather.temperatureC) + ' C' : '--'}</strong></span></div>
                    <div><CloudRain className="h-4 w-4" /><span><small>{t.rain}</small><strong>{currentWeather ? Math.round(currentWeather.precipProbability) + '%' : '--'}</strong></span></div>
                    <div><Wind className="h-4 w-4" /><span><small>km/h</small><strong>{currentWeather ? Math.round(currentWeather.windSpeedKmh) : '--'}</strong></span></div>
                  </div>
                </div>

                <p className="ops-score-basis">{dashboardCopy.scoreBasis}</p>
              </aside>

              <section className="ops-outlook-panel premium-glass-card">
                <div className="ops-panel-heading">
                  <span><CloudRain className="h-4 w-4" /> {t.weather}</span>
                  <button type="button" onClick={() => setActiveTab('weather')}>{dashboardCopy.viewForecast}<ChevronRight className="h-4 w-4" /></button>
                </div>
                {outlookData.length ? (
                  <div className="ops-day-strip" aria-label={t.weather + ' - ' + t.sevenDays}>
                    {outlookData.slice(0, 4).map((day) => (
                      <button key={day.day} type="button" onClick={() => setActiveTab('weather')} className={day.safe ? 'ops-day-card ops-day-safe' : 'ops-day-card'}>
                        <strong>{day.day}</strong>
                        <span><CloudRain className="h-3.5 w-3.5" /> {day.rainChance}%</span>
                        <span><Wind className="h-3.5 w-3.5" /> {day.wind}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="ops-chart-empty"><RefreshCw className="h-5 w-5 animate-spin" /> {t.loading}</div>
                )}
              </section>

              <section className="ops-action-panel premium-glass-card">
                <div className="ops-panel-heading">
                  <span><CalendarCheck className="h-4 w-4" /> {t.whatToDo}</span>
                  <small>{t.today}</small>
                </div>
                <div className="ops-action-queue">
                  <button type="button" onClick={() => setActiveTab('weather')}>
                    <span className="ops-action-number ops-action-critical">01</span>
                    <span><small>{t.alerts}</small><strong>{topAlert?.title || t.noMajorRisk}</strong></span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => setActiveTab('tools')}>
                    <span className="ops-action-number">02</span>
                    <span><small>{t.timing}</small><strong>{intelligence.fertilizerPlan.timing}</strong></span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => document.getElementById('crop-scan')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>
                    <span className="ops-action-number ops-action-blue">03</span>
                    <span><small>{t.cropDiseaseScan}</small><strong>{t.captureOrUploadCropPhoto}</strong></span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </section>

              <FertilizerGapCard crop={intelligence.fertilizerPlan.crop} language={lang} />

              <div id="crop-scan" className="ops-scan-panel">
                <HomeTab t={t} lang={lang} coords={coords} onAddScan={addScan} />
              </div>

              <section className="ops-market-panel premium-glass-card">
                <div className="ops-panel-heading">
                  <span><BarChart3 className="h-4 w-4" /> {dashboardCopy.nearestMarket}</span>
                  <small>{apmcDirectory.dataSource === 'live' ? dashboardCopy.live : dashboardCopy.locationBased}</small>
                </div>
                <div className="ops-market-location">
                  <MapPin className="h-5 w-5" />
                  <span><small>{displayDistrict}</small><strong>{marketName}</strong></span>
                  {apmcDirectory.dataSource !== 'live' && <em>~{market.distanceKm} km</em>}
                </div>
                <div className="ops-market-crop">
                  <span><small>{dashboardCopy.cropOpportunity}</small><strong>{topCrop?.localName || t.addFarmData}</strong></span>
                  <em className={'ops-market-signal ops-market-signal-' + marketSignal}>{marketSignalLabel}</em>
                </div>
                <button type="button" onClick={() => setActiveTab('mandi')}>{dashboardCopy.compareMarkets}<ChevronRight className="h-4 w-4" /></button>
              </section>

              <section className="ops-plan-panel premium-glass-card ops-plan-compact">
                <div>
                  <span><MapPin className="h-4 w-4" /> {t.farmPlan}</span>
                  <strong>{farmTwin.farmSizeHectares.toFixed(1)} {t.hectareShort} - {displayDistrict}</strong>
                </div>
                <button type="button" onClick={() => setActiveTab('tools')}>{t.farmPlan}<ChevronRight className="h-4 w-4" /></button>
              </section>
            </div>
          </section>

          <section className={activeTab === 'weather' ? 'block' : 'hidden'} aria-hidden={activeTab !== 'weather'}><WeatherTab t={t} lang={lang} coords={coords} /></section>
          <section className={activeTab === 'mandi' ? 'block' : 'hidden'} aria-hidden={activeTab !== 'mandi'}><MandiTab t={t} lang={lang} market={{ ...market, village: displayLocality, apmcName: marketName }} /></section>
          <section className={activeTab === 'farm' ? 'block' : 'hidden'} aria-hidden={activeTab !== 'farm'}><FarmTab t={t} lang={lang} scans={scans} farm={{ region: displayDistrict || farmTwin.region, farmSizeHectares: farmTwin.farmSizeHectares }} /></section>
          <section className={activeTab === 'tools' ? 'block' : 'hidden'} aria-hidden={activeTab !== 'tools'}><FieldPlanner coords={coords} market={market} lang={lang} placeLabel={displayDistrict} /></section>
          <section className={activeTab === 'commerce' ? 'block' : 'hidden'} aria-hidden={activeTab !== 'commerce'}><CommerceHub lang={lang} placeLabel={displayDistrict} /></section>
        </main>

        <BottomNav activeTab={activeTab} onChange={setActiveTab} t={t} locality={displayLocality} userName={userName} lang={lang} />
      </div>
    </div>
  );
}
