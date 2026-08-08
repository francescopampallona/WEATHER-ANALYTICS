import {
  CurrentWeather,
  DailyWeatherRecord,
  HistoricalDataResult,
  OpenMeteoForecastResponse,
  OpenMeteoArchiveResponse,
} from '../models/weather';
import { Location } from '../models/location';
import { cacheService } from './cacheService';

/**
 * Maps WMO Weather Interpretation Codes (WW) to English descriptions
 */
export function getWeatherDescription(code: number | null | undefined): string {
  if (code === null || code === undefined) return 'Unknown';
  switch (code) {
    case 0:
      return 'Clear sky';
    case 1:
      return 'Mainly clear';
    case 2:
      return 'Partly cloudy';
    case 3:
      return 'Overcast';
    case 45:
    case 48:
      return 'Fog / Depositing rime fog';
    case 51:
      return 'Light drizzle';
    case 53:
      return 'Moderate drizzle';
    case 55:
      return 'Dense drizzle';
    case 56:
    case 57:
      return 'Freezing drizzle';
    case 61:
      return 'Slight rain';
    case 63:
      return 'Moderate rain';
    case 65:
      return 'Heavy rain';
    case 66:
    case 67:
      return 'Freezing rain';
    case 71:
      return 'Slight snow fall';
    case 73:
      return 'Moderate snow fall';
    case 75:
      return 'Heavy snow fall';
    case 77:
      return 'Snow grains';
    case 80:
    case 81:
    case 82:
      return 'Rain showers';
    case 85:
    case 86:
      return 'Snow showers';
    case 95:
      return 'Thunderstorm';
    case 96:
    case 99:
      return 'Thunderstorm with hail';
    default:
      return 'Varied weather';
  }
}

/**
 * Fetches current weather and today's max/min from Open-Meteo Forecast API
 */
export async function getCurrentWeather(location: Location): Promise<CurrentWeather> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Open-Meteo Forecast API HTTP error ${res.status}`);
    }
    const data: OpenMeteoForecastResponse = await res.json();

    if (!data.current) {
      throw new Error('Incomplete forecast response from Open-Meteo');
    }

    const cur = data.current;
    const tempMax = data.daily?.temperature_2m_max?.[0] ?? cur.temperature_2m;
    const tempMin = data.daily?.temperature_2m_min?.[0] ?? cur.temperature_2m;

    return {
      temperature: cur.temperature_2m,
      apparentTemperature: cur.apparent_temperature,
      weatherCode: cur.weather_code,
      weatherDescription: getWeatherDescription(cur.weather_code),
      isDay: cur.is_day,
      relativeHumidity: cur.relative_humidity_2m,
      windSpeed: cur.wind_speed_10m,
      precipitation: cur.precipitation,
      tempMin,
      tempMax,
      time: cur.time,
    };
  } catch (error) {
    console.error('Error fetching current weather:', error);
    throw new Error('Unable to retrieve current weather data. Please check connection and try again.');
  }
}

/**
 * Fetches historical weather daily time-series from Open-Meteo Historical Archive API
 * Supports caching to optimize HTTP requests.
 */
export async function getHistoricalWeather(
  location: Location,
  startDate: string, // YYYY-MM-DD
  endDate: string, // YYYY-MM-DD
  forceRefresh: boolean = false
): Promise<HistoricalDataResult> {
  const cacheKey = cacheService.generateKey('archive', {
    lat: location.latitude.toFixed(4),
    lon: location.longitude.toFixed(4),
    start: startDate,
    end: endDate,
  });

  if (!forceRefresh) {
    const cached = cacheService.get<HistoricalDataResult>(cacheKey);
    if (cached) {
      return cached;
    }
  }

  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${location.latitude}&longitude=${location.longitude}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_mean,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,weather_code&timezone=auto`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 400) {
        throw new Error('Invalid date range or no historical data is available for the selected period.');
      }
      throw new Error(`Open-Meteo Archive API HTTP error ${res.status}`);
    }

    const data: OpenMeteoArchiveResponse = await res.json();
    if (!data.daily || !data.daily.time || data.daily.time.length === 0) {
      throw new Error('No historical weather data returned for this location and date range.');
    }

    const daily = data.daily;
    const records: DailyWeatherRecord[] = [];

    for (let i = 0; i < daily.time.length; i++) {
      const dateStr = daily.time[i];
      const parts = dateStr.split('-');
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);

      const meanVal = daily.temperature_2m_mean?.[i] ?? null;
      const minVal = daily.temperature_2m_min?.[i] ?? null;
      const maxVal = daily.temperature_2m_max?.[i] ?? null;
      const precipVal = daily.precipitation_sum?.[i] ?? null;
      const windVal = daily.wind_speed_10m_max?.[i] ?? null;
      const codeVal = daily.weather_code?.[i] ?? null;

      records.push({
        date: dateStr,
        year,
        month,
        day,
        tempMean: meanVal,
        tempMin: minVal,
        tempMax: maxVal,
        precipitation: precipVal,
        windSpeedMax: windVal,
        weatherCode: codeVal,
      });
    }

    const result: HistoricalDataResult = {
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone || 'auto',
      elevation: data.elevation,
      records,
    };

    cacheService.set(cacheKey, result);
    return result;
  } catch (error: any) {
    console.error('Error fetching historical weather from Open-Meteo:', error);
    throw new Error(error.message || 'Unable to retrieve historical weather data.');
  }
}
