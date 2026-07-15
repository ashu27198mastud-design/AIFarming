'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Bell, BellRing, CheckCircle2, CloudRain, Droplets, Sun, Wind } from 'lucide-react';
import type { TranslationSet } from '@/lib/i18n';
import type { DailyWeather, WeatherForecast } from '@/types';

type Props = {
  t: TranslationSet;
  lang: string;
  coords: { lat: number; lng: number };
};

type AlertItem = { key: string; title: string; detail: string; tone: 'amber' | 'red' | 'blue'; body: string };
type NotificationState = NotificationPermission | 'unsupported';

const WEATHER_PUSH_ENABLED_KEY = 'km-weather-push-enabled';
const WEATHER_PUSH_SENT_KEY = 'km-weather-push-sent-v1';
const WEATHER_PUSH_REPEAT_MS = 12 * 60 * 60 * 1000;
function readNotificationState(): NotificationState {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission;
}
function readPushEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(WEATHER_PUSH_ENABLED_KEY) === 'true';
}

function weatherLocale(lang: string): string {
  if (lang === 'mr') return 'mr-IN';
  if (lang === 'hi') return 'hi-IN';
  return 'en-IN';
}

function buildAlerts(days: DailyWeather[], t: TranslationSet, lang: string): AlertItem[] {
  const alerts: AlertItem[] = [];
  const locale = weatherLocale(lang);
  for (const day of days) {
    const label = new Date(day.date).toLocaleDateString(locale, { weekday: 'short' });
    if (day.precipProbability > 70) alerts.push({ key: `${day.date}-rain`, title: t.alert, detail: `${label} - ${Math.round(day.precipProbability)}% ${t.rain}`, tone: 'amber', body: t.weatherRisksNotify });
    if (day.windSpeedKmh > 30) alerts.push({ key: `${day.date}-wind`, title: t.alert, detail: `${label} - ${Math.round(day.windSpeedKmh)} km/h`, tone: 'amber', body: t.weatherRisksNotify });
    if (day.maxTempC > 40) alerts.push({ key: `${day.date}-heat`, title: t.alert, detail: `${label} - ${Math.round(day.maxTempC)} C`, tone: 'red', body: t.weatherRisksNotify });
    if (day.minTempC < 5) alerts.push({ key: `${day.date}-frost`, title: t.alert, detail: `${label} - ${Math.round(day.minTempC)} C`, tone: 'blue', body: t.weatherRisksNotify });
  }
  return alerts.slice(0, 3);
}

function readSentAlerts(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(WEATHER_PUSH_SENT_KEY) || '{}') as Record<string, number>;
  } catch {
    return {};
  }
}

async function showBrowserAlert(alert: AlertItem): Promise<void> {
  const options: NotificationOptions = {
    body: `${alert.detail}. ${alert.body}`,
    tag: `kisanmitra-${alert.key}`,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: { url: '/' },
  };

  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready.catch(() => null);
    if (registration?.showNotification) {
      await registration.showNotification(`KisanMitra: ${alert.title}`, options);
      return;
    }
  }

  new Notification(`KisanMitra: ${alert.title}`, options);
}

export default function WeatherTab({ t, lang, coords }: Props) {
  const [forecast, setForecast] = useState<WeatherForecast | null>(null);
  const [error, setError] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [notificationState, setNotificationState] = useState<NotificationState>('unsupported');

  useEffect(() => {
    const storageTimer = window.setTimeout(() => {
      setNotificationState(readNotificationState());
      setPushEnabled(readPushEnabled());
    }, 0);
    return () => window.clearTimeout(storageTimer);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/weather?lat=${coords.lat}&lng=${coords.lng}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Weather request failed');
        return response.json();
      })
      .then((payload: WeatherForecast) => {
        setForecast(payload);
        setError(false);
      })
      .catch((caught) => {
        if ((caught as Error).name !== 'AbortError') setError(true);
      });
    return () => controller.abort();
  }, [coords.lat, coords.lng]);

  const alerts = useMemo(() => buildAlerts(forecast?.daily ?? [], t, lang), [forecast, lang, t]);
  const current = forecast?.hourly?.[0];

  const notifyAlerts = useCallback(async (items: AlertItem[], force = false) => {
    if (!items.length || !('Notification' in window)) {
      setNotificationState('unsupported');
      return;
    }

    let permission = Notification.permission;
    if (permission === 'default') permission = await Notification.requestPermission();
    setNotificationState(permission);
    if (permission !== 'granted') return;

    const now = Date.now();
    const sent = readSentAlerts();
    const due = force ? items.slice(0, 1) : items.filter((alert) => !sent[alert.key] || now - sent[alert.key] > WEATHER_PUSH_REPEAT_MS);

    for (const alert of due.slice(0, 2)) {
      await showBrowserAlert(alert);
      sent[alert.key] = now;
    }

    localStorage.setItem(WEATHER_PUSH_SENT_KEY, JSON.stringify(sent));
  }, []);

  const enablePushAlerts = async () => {
    window.localStorage.setItem(WEATHER_PUSH_ENABLED_KEY, 'true');
    setPushEnabled(true);
    await notifyAlerts(alerts, true);
  };

  useEffect(() => {
    if (!pushEnabled || notificationState !== 'granted' || !alerts.length) return undefined;
    const timer = window.setTimeout(() => void notifyAlerts(alerts), 0);
    return () => window.clearTimeout(timer);
  }, [alerts, notificationState, notifyAlerts, pushEnabled]);

  if (!forecast && !error) return <div className="m3-card text-center text-sm font-medium text-[#5F6368]">{t.loading}</div>;

  const pushCopy = notificationState === 'unsupported'
    ? t.browserAlertsUnavailable
    : notificationState === 'denied'
      ? t.notificationsBlocked
      : pushEnabled && notificationState === 'granted'
        ? t.pushAlertsOn
        : t.enablePushAlerts;

  return (
    <div className="space-y-4">
      {error && <div className="rounded-2xl bg-[#FCE8E6] p-4 text-sm font-semibold text-[#C5221F]">{t.weatherUnavailable}</div>}

      {current && (
        <section className="m3-card">
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="section-kicker">{t.now}</span>
              <div className="mt-2 flex items-end gap-2">
                <strong className="text-4xl font-bold text-[#202124]">{Math.round(current.temperatureC)} C</strong>
                <span className="pb-1 text-sm font-medium text-[#5F6368]">{forecast.dataSource}</span>
              </div>
            </div>
            <CloudRain className="h-12 w-12 text-[#1A73E8]" />
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className="google-metric"><Wind className="h-4 w-4" /><strong>{Math.round(current.windSpeedKmh)}</strong><span>km/h</span></div>
            <div className="google-metric"><Droplets className="h-4 w-4" /><strong>{Math.round(current.humidity)}%</strong><span>{t.humidity}</span></div>
            <div className="google-metric"><CloudRain className="h-4 w-4" /><strong>{Math.round(current.precipProbability)}%</strong><span>{t.rain}</span></div>
          </div>
        </section>
      )}

      <section className="m3-card">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <span className="section-kicker">{t.alerts}</span>
          <button
            type="button"
            onClick={() => void enablePushAlerts()}
            disabled={notificationState === 'unsupported' || notificationState === 'denied'}
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#DADCE0] bg-white px-4 text-xs font-extrabold text-[#3C4043] disabled:opacity-60"
          >
            {pushEnabled && notificationState === 'granted' ? <BellRing className="h-4 w-4 text-[#137333]" /> : <Bell className="h-4 w-4 text-[#F9AB00]" />}
            {pushCopy}
          </button>
        </div>
        {alerts.length ? (
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div key={alert.key} className={`clean-alert ${alert.tone === 'red' ? 'clean-alert-red' : alert.tone === 'blue' ? 'clean-alert-blue' : ''}`}>
                <strong>{alert.title}</strong><span>{alert.detail}</span>
              </div>
            ))}
          </div>
        ) : <p className="text-sm font-medium text-[#5F6368]">{t.noMajorWeatherRisk}</p>}
        {pushEnabled && notificationState === 'granted' && (
          <p className="mt-3 flex items-center gap-2 rounded-2xl bg-[#E6F4EA] px-4 py-3 text-xs font-bold text-[#137333]"><CheckCircle2 className="h-4 w-4" /> {t.weatherRisksNotify}</p>
        )}
      </section>

      <section className="m3-card">
        <span className="section-kicker">{t.sevenDays}</span>
        <div className="mt-3 divide-y divide-[#EEF0EF]">
          {forecast?.daily.map((day) => (
            <div key={day.date} className="flex items-center justify-between gap-3 py-3 text-sm">
              <span className="w-12 font-semibold text-[#3C4043]">{new Date(day.date).toLocaleDateString(weatherLocale(lang), { weekday: 'short' })}</span>
              <span className="flex items-center gap-2 text-[#5F6368]"><Sun className="h-4 w-4" />{Math.round(day.precipProbability)}% {t.rain}</span>
              <span className="font-semibold text-[#202124]">{Math.round(day.maxTempC)} / {Math.round(day.minTempC)} C</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
