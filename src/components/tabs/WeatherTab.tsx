'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CloudRain, Snowflake, Sun, Wind } from 'lucide-react';
import type { TranslationSet } from '@/lib/i18n';
import type { DailyWeather, WeatherForecast } from '@/types';

type Props = {
  t: TranslationSet;
  coords: { lat: number; lng: number };
};

type AlertItem = { key: string; text: string; tone: string };

function weatherIcon(day: DailyWeather): string {
  if (day.precipProbability > 70) return '🌧️';
  if (day.precipProbability > 35) return '🌦️';
  if (day.maxTempC > 38) return '☀️';
  return '🌤️';
}

function buildAlerts(days: DailyWeather[]): AlertItem[] {
  const alerts: AlertItem[] = [];
  for (const day of days) {
    const label = new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' });
    if (day.precipProbability > 70) alerts.push({ key: `${day.date}-rain`, text: `${label}: बारिश की संभावना ${Math.round(day.precipProbability)}% — छिड़काव टालें / Rain risk ${Math.round(day.precipProbability)}% — postpone spraying.`, tone: 'amber' });
    if (day.windSpeedKmh > 30) alerts.push({ key: `${day.date}-wind`, text: `${label}: हवा ${Math.round(day.windSpeedKmh)} km/h — छिड़काव सुरक्षित नहीं / High wind — avoid spraying.`, tone: 'amber' });
    if (day.maxTempC > 40) alerts.push({ key: `${day.date}-heat`, text: `${label}: अधिकतम ${Math.round(day.maxTempC)}°C — गर्मी से फसल बचाएं / Heat alert — protect crop and irrigation timing.`, tone: 'rose' });
    if (day.minTempC < 5) alerts.push({ key: `${day.date}-frost`, text: `${label}: न्यूनतम ${Math.round(day.minTempC)}°C — पाला जोखिम / Frost risk — protect sensitive crop.`, tone: 'blue' });
  }
  return alerts.slice(0, 5);
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

  if (!forecast && !error) return <div className="m3-card text-center font-semibold text-zinc-500">{t.loading}</div>;

  return (
    <div className="space-y-4">
      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">Weather service unavailable.</div>}

      {alerts.length > 0 ? alerts.map((alert) => (
        <div key={alert.key} className={`flex items-start gap-3 rounded-3xl border p-4 ${alert.tone === 'rose' ? 'border-rose-200 bg-rose-50 text-rose-800' : alert.tone === 'blue' ? 'border-blue-200 bg-blue-50 text-blue-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
          {alert.tone === 'blue' ? <Snowflake className="mt-0.5 h-5 w-5 flex-shrink-0" /> : alert.tone === 'rose' ? <Sun className="mt-0.5 h-5 w-5 flex-shrink-0" /> : <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />}
          <span className="text-sm font-bold">{alert.text}</span>
        </div>
      )) : (
        <div className="rounded-3xl border border-[#D8E0E8] bg-[#F3F6F9] p-4 text-sm font-bold text-[#52687C]">No threshold-based weather alerts in the next 7 days.</div>
      )}

      {current && (
        <div className="m3-card text-center">
          <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">GPS {coords.lat.toFixed(3)}, {coords.lng.toFixed(3)} · {forecast?.dataSource}</span>
          <div className="mb-2 flex items-center justify-center gap-4">
            <CloudRain className="h-16 w-16 text-[#61788D]" />
            <div><h2 className="text-4xl font-extrabold text-[#242824]">{Math.round(current.temperatureC)}°C</h2><p className="text-sm font-semibold text-zinc-500">Live hourly forecast</p></div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-zinc-100 pt-4">
            <div><Wind className="mx-auto h-4 w-4 text-zinc-500" /><span className="block text-xs font-bold text-zinc-400">Wind</span><span className="text-sm font-extrabold text-zinc-700">{Math.round(current.windSpeedKmh)} km/h</span></div>
            <div><span className="block text-xs font-bold text-zinc-400">Humidity</span><span className="text-sm font-extrabold text-zinc-700">{Math.round(current.humidity)}%</span></div>
            <div><span className="block text-xs font-bold text-zinc-400">Rain</span><span className="text-sm font-extrabold text-zinc-700">{Math.round(current.precipProbability)}%</span></div>
          </div>
        </div>
      )}

      <div className="m3-card space-y-3">
        <span className="block text-xs font-bold uppercase tracking-wider text-zinc-500">{t.forecast}</span>
        {forecast?.daily.map((day) => (
          <div key={day.date} className="flex items-center justify-between border-b border-zinc-100 py-2 text-sm font-bold text-zinc-700 last:border-0">
            <span>{new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short' })}</span>
            <span className="flex items-center gap-2"><span>{weatherIcon(day)}</span><span className="text-zinc-500">Rain {Math.round(day.precipProbability)}%</span></span>
            <span className="font-mono text-xs">{Math.round(day.maxTempC)}° / {Math.round(day.minTempC)}°</span>
          </div>
        ))}
      </div>
    </div>
  );
}
