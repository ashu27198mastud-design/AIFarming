// AETHER AG — Open-Meteo Weather Adapter
import type { WeatherForecast, HourlyWeather, DailyWeather } from '@/types';

const DEMO_LOCATION = { lat: 20.014, lng: 73.785 }; // Nashik, Maharashtra

export async function fetchWeatherForecast(lat: number = DEMO_LOCATION.lat, lng: number = DEMO_LOCATION.lng): Promise<WeatherForecast> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,wind_speed_10m,soil_moisture_0_to_1cm,et0_fao_evapotranspiration&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,relative_humidity_2m_mean,uv_index_max,sunrise,sunset&timezone=Asia%2FKolkata&forecast_days=7`;
    const response = await fetch(url, { next: { revalidate: 1800 } }); // cache 30min
    if (!response.ok) throw new Error('Weather fetch failed');
    const data = await response.json();
    return parseOpenMeteoResponse(data, lat, lng);
  } catch (error) {
    console.warn('Weather API unavailable, using demo data:', error);
    return getDemoWeatherForecast(lat, lng);
  }
}

function parseOpenMeteoResponse(data: any, lat: number, lng: number): WeatherForecast {
  const hourly: HourlyWeather[] = (data.hourly?.time ?? []).slice(0, 48).map((time: string, i: number) => ({
    time,
    temperatureC: data.hourly.temperature_2m?.[i] ?? 28,
    humidity: data.hourly.relative_humidity_2m?.[i] ?? 75,
    precipMm: data.hourly.precipitation?.[i] ?? 0,
    precipProbability: data.hourly.precipitation_probability?.[i] ?? 0,
    windSpeedKmh: data.hourly.wind_speed_10m?.[i] ?? 10,
    soilMoisture: (data.hourly.soil_moisture_0_to_1cm?.[i] ?? 0.3) * 100,
    evapotranspirationMm: data.hourly.et0_fao_evapotranspiration?.[i] ?? 3.5,
  }));
  const daily: DailyWeather[] = (data.daily?.time ?? []).map((date: string, i: number) => ({
    date,
    maxTempC: data.daily.temperature_2m_max?.[i] ?? 34,
    minTempC: data.daily.temperature_2m_min?.[i] ?? 24,
    precipMm: data.daily.precipitation_sum?.[i] ?? 0,
    precipProbability: data.daily.precipitation_probability_max?.[i] ?? 0,
    windSpeedKmh: data.daily.wind_speed_10m_max?.[i] ?? 15,
    humidityMean: data.daily.relative_humidity_2m_mean?.[i] ?? 75,
    uvIndex: data.daily.uv_index_max?.[i] ?? 8,
    sunrise: data.daily.sunrise?.[i] ?? '06:15',
    sunset: data.daily.sunset?.[i] ?? '19:20',
  }));
  return { fieldId: 'field-north', location: { lat, lng }, fetchedAt: new Date().toISOString(), dataSource: 'live', hourly, daily, alerts: [] };
}

export function getDemoWeatherForecast(lat: number = DEMO_LOCATION.lat, lng: number = DEMO_LOCATION.lng): WeatherForecast {
  const now = new Date();
  const hourly: HourlyWeather[] = Array.from({ length: 48 }, (_, i) => ({
    time: new Date(now.getTime() + i * 3600000).toISOString(),
    temperatureC: 28 + Math.sin(i / 4) * 5,
    humidity: 82 + Math.sin(i / 6) * 8,
    precipMm: i >= 18 && i <= 24 ? 4.5 : 0,
    precipProbability: i >= 12 ? Math.min(90, 40 + i * 2) : 20,
    windSpeedKmh: 12 + Math.random() * 8,
    soilMoisture: 78 - i * 0.3,
    evapotranspirationMm: 3.8,
  }));
  const daily: DailyWeather[] = Array.from({ length: 7 }, (_, i) => ({
    date: new Date(now.getTime() + i * 86400000).toISOString().split('T')[0],
    maxTempC: 34 + Math.random() * 3 - 1,
    minTempC: 24 + Math.random() * 2 - 1,
    precipMm: i === 1 ? 34 : i === 3 ? 8 : 0,
    precipProbability: i === 0 ? 70 : i === 1 ? 90 : i === 2 ? 30 : 15,
    windSpeedKmh: i === 2 ? 28 : 12 + Math.random() * 8,
    humidityMean: 82 + Math.random() * 5,
    uvIndex: 9,
    sunrise: '06:15',
    sunset: '19:22',
  }));
  return { fieldId: 'field-north', location: { lat, lng }, fetchedAt: new Date().toISOString(), dataSource: 'simulated', hourly, daily, alerts: [] };
}
