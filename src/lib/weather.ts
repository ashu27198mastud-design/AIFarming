// KisanMitra weather adapters: AccuWeather when configured, Open-Meteo fallback.
import type { WeatherAlert, WeatherForecast, HourlyWeather, DailyWeather } from '@/types';

const DEMO_LOCATION = { lat: 20.014, lng: 73.785 }; // Nashik, Maharashtra
const ACCUWEATHER_BASE_URL = 'https://dataservice.accuweather.com';

type OpenMeteoResponse = {
  hourly?: {
    time?: string[];
    temperature_2m?: number[];
    relative_humidity_2m?: number[];
    precipitation_probability?: number[];
    precipitation?: number[];
    wind_speed_10m?: number[];
    soil_moisture_0_to_1cm?: number[];
    et0_fao_evapotranspiration?: number[];
  };
  daily?: {
    time?: string[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    precipitation_sum?: number[];
    precipitation_probability_max?: number[];
    wind_speed_10m_max?: number[];
    relative_humidity_2m_mean?: number[];
    uv_index_max?: number[];
    sunrise?: string[];
    sunset?: string[];
  };
};

type AccuWeatherLocation = {
  Key?: string;
  GeoPosition?: { Latitude?: number; Longitude?: number };
};

type AccuWeatherUnitValue = {
  Value?: number;
  Unit?: string;
};

type AccuWeatherHourlyItem = {
  DateTime?: string;
  Temperature?: AccuWeatherUnitValue;
  RelativeHumidity?: number;
  PrecipitationProbability?: number;
  Rain?: AccuWeatherUnitValue;
  Wind?: { Speed?: AccuWeatherUnitValue };
  UVIndex?: number;
};

type AccuWeatherDailyPeriod = {
  PrecipitationProbability?: number;
  Rain?: AccuWeatherUnitValue;
  Wind?: { Speed?: AccuWeatherUnitValue };
};

type AccuWeatherDailyItem = {
  Date?: string;
  Temperature?: {
    Minimum?: AccuWeatherUnitValue;
    Maximum?: AccuWeatherUnitValue;
  };
  Day?: AccuWeatherDailyPeriod;
  Night?: AccuWeatherDailyPeriod;
  Sun?: { Rise?: string; Set?: string };
  AirAndPollen?: Array<{ Name?: string; Value?: number }>;
};

type AccuWeatherDailyResponse = {
  DailyForecasts?: AccuWeatherDailyItem[];
};

export async function fetchWeatherForecast(lat: number = DEMO_LOCATION.lat, lng: number = DEMO_LOCATION.lng): Promise<WeatherForecast> {
  const accuweatherApiKey = process.env.ACCUWEATHER_API_KEY;

  if (accuweatherApiKey) {
    try {
      return await fetchAccuWeatherForecast(lat, lng, accuweatherApiKey);
    } catch (error) {
      console.warn('AccuWeather unavailable, falling back to Open-Meteo:', error);
    }
  }

  try {
    return await fetchOpenMeteoForecast(lat, lng);
  } catch (error) {
    console.warn('Weather API unavailable, using demo data:', error);
    return getDemoWeatherForecast(lat, lng);
  }
}

async function fetchOpenMeteoForecast(lat: number, lng: number): Promise<WeatherForecast> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,wind_speed_10m,soil_moisture_0_to_1cm,et0_fao_evapotranspiration&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,relative_humidity_2m_mean,uv_index_max,sunrise,sunset&timezone=Asia%2FKolkata&forecast_days=7`;
  const response = await fetch(url, { next: { revalidate: 1800 } });
  if (!response.ok) throw new Error(`Open-Meteo weather fetch failed: ${response.status}`);
  const data = await response.json() as OpenMeteoResponse;
  return parseOpenMeteoResponse(data, lat, lng);
}

async function fetchAccuWeatherForecast(lat: number, lng: number, apiKey: string): Promise<WeatherForecast> {
  const location = await fetchAccuWeatherLocation(lat, lng, apiKey);
  if (!location.Key) throw new Error('AccuWeather location key missing');

  const params = new URLSearchParams({ apikey: apiKey, details: 'true', metric: 'true' });
  const [dailyResponse, hourlyResponse] = await Promise.all([
    fetchAccuWeatherJson<AccuWeatherDailyResponse>(`/forecasts/v1/daily/5day/${location.Key}?${params.toString()}`),
    fetchAccuWeatherJson<AccuWeatherHourlyItem[]>(`/forecasts/v1/hourly/12hour/${location.Key}?${params.toString()}`),
  ]);

  const forecastLocation = {
    lat: location.GeoPosition?.Latitude ?? lat,
    lng: location.GeoPosition?.Longitude ?? lng,
  };
  const hourly = parseAccuWeatherHourly(hourlyResponse);
  const daily = parseAccuWeatherDaily(dailyResponse);

  if (!daily.length && !hourly.length) throw new Error('AccuWeather forecast response was empty');

  return {
    fieldId: 'field-north',
    location: forecastLocation,
    fetchedAt: new Date().toISOString(),
    dataSource: 'live',
    hourly,
    daily,
    alerts: buildWeatherAlerts(daily),
  };
}

async function fetchAccuWeatherLocation(lat: number, lng: number, apiKey: string): Promise<AccuWeatherLocation> {
  const params = new URLSearchParams({ apikey: apiKey, q: `${lat},${lng}` });
  return fetchAccuWeatherJson<AccuWeatherLocation>(`/locations/v1/cities/geoposition/search?${params.toString()}`);
}

async function fetchAccuWeatherJson<T>(path: string): Promise<T> {
  const response = await fetch(`${ACCUWEATHER_BASE_URL}${path}`, { next: { revalidate: 1800 } });
  if (!response.ok) throw new Error(`AccuWeather fetch failed: ${response.status}`);
  return response.json() as Promise<T>;
}

function parseOpenMeteoResponse(data: OpenMeteoResponse, lat: number, lng: number): WeatherForecast {
  const hourlyData = data.hourly ?? {};
  const dailyData = data.daily ?? {};
  const hourly: HourlyWeather[] = (hourlyData.time ?? []).slice(0, 48).map((time: string, i: number) => ({
    time,
    temperatureC: hourlyData.temperature_2m?.[i] ?? 28,
    humidity: hourlyData.relative_humidity_2m?.[i] ?? 75,
    precipMm: hourlyData.precipitation?.[i] ?? 0,
    precipProbability: hourlyData.precipitation_probability?.[i] ?? 0,
    windSpeedKmh: hourlyData.wind_speed_10m?.[i] ?? 10,
    soilMoisture: (hourlyData.soil_moisture_0_to_1cm?.[i] ?? 0.3) * 100,
    evapotranspirationMm: hourlyData.et0_fao_evapotranspiration?.[i] ?? 3.5,
  }));
  const daily: DailyWeather[] = (dailyData.time ?? []).map((date: string, i: number) => ({
    date,
    maxTempC: dailyData.temperature_2m_max?.[i] ?? 34,
    minTempC: dailyData.temperature_2m_min?.[i] ?? 24,
    precipMm: dailyData.precipitation_sum?.[i] ?? 0,
    precipProbability: dailyData.precipitation_probability_max?.[i] ?? 0,
    windSpeedKmh: dailyData.wind_speed_10m_max?.[i] ?? 15,
    humidityMean: dailyData.relative_humidity_2m_mean?.[i] ?? 75,
    uvIndex: dailyData.uv_index_max?.[i] ?? 8,
    sunrise: dailyData.sunrise?.[i] ?? '06:15',
    sunset: dailyData.sunset?.[i] ?? '19:20',
  }));
  return { fieldId: 'field-north', location: { lat, lng }, fetchedAt: new Date().toISOString(), dataSource: 'live', hourly, daily, alerts: buildWeatherAlerts(daily) };
}

function parseAccuWeatherHourly(items: AccuWeatherHourlyItem[]): HourlyWeather[] {
  return items.slice(0, 48).map((item) => ({
    time: item.DateTime ?? new Date().toISOString(),
    temperatureC: toCelsius(item.Temperature),
    humidity: item.RelativeHumidity ?? 75,
    precipMm: toMillimeters(item.Rain),
    precipProbability: item.PrecipitationProbability ?? 0,
    windSpeedKmh: toKmh(item.Wind?.Speed),
    soilMoisture: 35,
    evapotranspirationMm: estimateEvapotranspiration(toCelsius(item.Temperature), item.RelativeHumidity ?? 75),
  }));
}

function parseAccuWeatherDaily(response: AccuWeatherDailyResponse): DailyWeather[] {
  return (response.DailyForecasts ?? []).map((item) => {
    const dayProbability = item.Day?.PrecipitationProbability ?? 0;
    const nightProbability = item.Night?.PrecipitationProbability ?? 0;
    return {
      date: item.Date ? item.Date.split('T')[0] : new Date().toISOString().split('T')[0],
      maxTempC: toCelsius(item.Temperature?.Maximum, 34),
      minTempC: toCelsius(item.Temperature?.Minimum, 24),
      precipMm: Math.max(toMillimeters(item.Day?.Rain), toMillimeters(item.Night?.Rain)),
      precipProbability: Math.max(dayProbability, nightProbability),
      windSpeedKmh: Math.max(toKmh(item.Day?.Wind?.Speed), toKmh(item.Night?.Wind?.Speed)),
      humidityMean: 75,
      uvIndex: item.AirAndPollen?.find((entry) => entry.Name === 'UVIndex')?.Value ?? 8,
      sunrise: item.Sun?.Rise ?? '06:15',
      sunset: item.Sun?.Set ?? '19:20',
    };
  });
}

function toCelsius(value?: AccuWeatherUnitValue, fallback = 28): number {
  if (typeof value?.Value !== 'number') return fallback;
  if (value.Unit === 'F') return (value.Value - 32) * (5 / 9);
  return value.Value;
}

function toMillimeters(value?: AccuWeatherUnitValue): number {
  if (typeof value?.Value !== 'number') return 0;
  const unit = value.Unit?.toLowerCase();
  if (unit === 'in' || unit === 'inch' || unit === 'inches') return value.Value * 25.4;
  return value.Value;
}

function toKmh(value?: AccuWeatherUnitValue): number {
  if (typeof value?.Value !== 'number') return 0;
  const unit = value.Unit?.toLowerCase();
  if (unit === 'mi/h' || unit === 'mph') return value.Value * 1.60934;
  if (unit === 'm/s') return value.Value * 3.6;
  return value.Value;
}

function estimateEvapotranspiration(temperatureC: number, humidity: number): number {
  const heatFactor = Math.max(0, temperatureC - 18) * 0.08;
  const humidityFactor = Math.max(0.2, 1 - humidity / 100);
  return Number((1.8 + heatFactor * humidityFactor).toFixed(2));
}

function buildWeatherAlerts(daily: DailyWeather[]): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  for (const day of daily) {
    if (day.precipProbability >= 70) {
      alerts.push({
        type: 'waterlogging',
        severity: day.precipProbability >= 90 ? 'high' : 'medium',
        message: `Rain risk ${Math.round(day.precipProbability)}%. Avoid spraying and protect open fertilizer inputs.`,
        startsAt: day.date,
        endsAt: day.date,
        affectedFields: ['field-north'],
      });
    }
    if (day.windSpeedKmh >= 30) {
      alerts.push({
        type: 'wind',
        severity: day.windSpeedKmh >= 45 ? 'high' : 'medium',
        message: `Wind risk ${Math.round(day.windSpeedKmh)} km/h. Shift spraying to a calmer window.`,
        startsAt: day.date,
        endsAt: day.date,
        affectedFields: ['field-north'],
      });
    }
    if (day.maxTempC >= 40) {
      alerts.push({
        type: 'heat',
        severity: day.maxTempC >= 44 ? 'high' : 'medium',
        message: `Heat risk ${Math.round(day.maxTempC)} C. Irrigate early or late and watch young plants.`,
        startsAt: day.date,
        endsAt: day.date,
        affectedFields: ['field-north'],
      });
    }
  }
  return alerts.slice(0, 4);
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
  return { fieldId: 'field-north', location: { lat, lng }, fetchedAt: new Date().toISOString(), dataSource: 'simulated', hourly, daily, alerts: buildWeatherAlerts(daily) };
}
