'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CloudRain, Droplets, Sun, Wind } from 'lucide-react';
import type { TranslationSet } from '@/lib/i18n';
import type { DailyWeather, WeatherForecast } from '@/types';

type Props = {
  t: TranslationSet;
  coords: { lat: number; lng: number };
};

type AlertItem = { key: string; title: string; detail: string; tone: 'amber' | 'red' | 'blue' };

function weatherIcon(day: DailyWeather): string {
  if (day.precipProbability > 70) return '🌧️';
  if (day.precipProbability > 35) return '🌦️';
  if (day.maxTempC > 38) return '☀️';
  return '🌤️';
}

function buildAlerts(days: DailyWeather[]): AlertItem[] {
  const alerts: AlertItem[] = [];
  for (const day of days) {
    const label = new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short' });
    if (day.precipProbability > 70) alerts.push({ key: `${day.date}-rain`, title: 'Spray warning', detail: `${label} · ${Math.round(day.precipProbability)}% rain`, tone: 'amber' });
    if (day.windSpeedKmh > 30) alerts.push({ key: `${day.date}-wind`, title: 'High wind', detail: `${label} · ${Math.round(day.windSpeedKmh)} km/h`, tone: 'amber' });
    if (day.maxTempC > 40) alerts.push({ key: `${day.date}-heat`, title: 'Heat alert', detail: `${label} · ${Math.round(day.maxTempC)}°C`, tone: 'red' });
    if (day.minTempC < 5) alerts.push({ key: `${day.date}-frost`, title: 'Frost alert', detail: `${label} · ${Math.round(day.minTempC)}°C`, tone: 'blue' });
  }
  return alerts.slice(0, 3);
}

export default function WeatherTab({ t, coords }: Props) {
  const [forecast, setForecast] = useState<WeatherForecast | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setError(false);
    fetch(`/api/weather?lat=${coords.lat}&lng=${coords.lng}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Weather request failed');
        return response.json();
      })
      .then((payload: WeatherForecast) => setForecast(payload))
      .catch((caught) => {
        if ((caught as Error).name !== 'AbortError') setError(true);
      });
    return () => controller.abort();
  }, [coords.lat, coords.lng]);

  const alerts = useMemo(() => buildAlerts(forecast?.daily ?? []), [forecast]);
  const current = forecast?.hourly?.[0];

  if (!forecast && !error) return <div className="m3-card text-center text-sm font-medium text-[#5F6368]">{t.loading}</div>;

  return (
    <div className="space-y-4">
      {error && <div className="rounded-2xl bg-[#FCE8E6] p-4 text-sm font-semibold text-[#C5221F]">Weather unavailable</div>}

      {current && (
        <section className="m3-card">
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="section-kicker">Now</span>
              <div className="mt-2 flex items-end gap-2">
                <strong className="text-4xl font-bold text-[#202124]">{Math.round(current.temperatureC)}°</strong>
                <span className="pb-1 text-sm font-medium text-[#5F6368]">{forecast.dataSource}</span>
              </div>
            </div>
            <CloudRain className="h-12 w-12 text-[#1A73E8]" />
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className="google-metric"><Wind className="h-4 w-4" /><strong>{Math.round(current.windSpeedKmh)}</strong><span>km/h</span></div>
            <div className="google-metric"><Droplets className="h-4 w-4" /><strong>{Math.round(current.humidity)}%</strong><span>humidity</span></div>
            <div className="google-metric"><CloudRain className="h-4 w-4" /><strong>{Math.round(current.precipProbability)}%</strong><span>rain</span></div>
          </div>
        </section>
      )}

      <section className="m3-card">
        <div className="mb-3 flex items-center justify-between">
          <span className="section-kicker">Alerts</span>
          <AlertTriangle className="h-4 w-4 text-[#F9AB00]" />
        </div>
        {alerts.length ? (
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div key={alert.key} className={`clean-alert ${alert.tone === 'red' ? 'clean-alert-red' : alert.tone === 'blue' ? 'clean-alert-blue' : ''}`}>
                <strong>{alert.title}</strong><span>{alert.detail}</span>
              </div>
            ))}
          </div>
        ) : <p className="text-sm font-medium text-[#5F6368]">No major weather risk</p>}
      </section>

      <section className="m3-card">
        <span className="section-kicker">7 days</span>
        <div className="mt-3 divide-y divide-[#EEF0EF]">
          {forecast?.daily.map((day) => (
            <div key={day.date} className="flex items-center justify-between py-3 text-sm">
              <span className="w-12 font-semibold text-[#3C4043]">{new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short' })}</span>
              <span className="flex items-center gap-2 text-[#5F6368]"><span>{weatherIcon(day)}</span>{Math.round(day.precipProbability)}%</span>
              <span className="font-semibold text-[#202124]">{Math.round(day.maxTempC)}° / {Math.round(day.minTempC)}°</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
