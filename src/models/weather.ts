export type TempUnit = 'C' | 'F';
export type WindUnit = 'kmh' | 'ms' | 'mph';
export type PrecipUnit = 'mm' | 'inch';
export type ThemeMode = 'system' | 'light' | 'dark';

export interface AppSettings {
  tempUnit: TempUnit;
  windUnit: WindUnit;
  precipUnit: PrecipUnit;
  theme: ThemeMode;
  defaultStartYear: number;
  defaultBaselineStart: number;
  defaultBaselineEnd: number;
}

export interface CurrentWeather {
  temperature: number;
  apparentTemperature?: number;
  weatherCode: number;
  weatherDescription: string;
  isDay?: number;
  relativeHumidity?: number;
  windSpeed: number;
  precipitation: number;
  tempMin: number;
  tempMax: number;
  time: string;
}

export interface DailyWeatherRecord {
  date: string; // YYYY-MM-DD
  year: number;
  month: number; // 1 - 12
  day: number; // 1 - 31
  tempMean: number | null;
  tempMin: number | null;
  tempMax: number | null;
  precipitation: number | null;
  windSpeedMax: number | null;
  weatherCode?: number | null;
}

export interface HistoricalDataResult {
  latitude: number;
  longitude: number;
  timezone: string;
  elevation?: number;
  records: DailyWeatherRecord[];
}

export interface OpenMeteoForecastResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  current?: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature?: number;
    is_day?: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  daily?: {
    time: string[];
    temperature_2m_max: (number | null)[];
    temperature_2m_min: (number | null)[];
    precipitation_sum: (number | null)[];
    wind_speed_10m_max: (number | null)[];
  };
}

export interface OpenMeteoArchiveResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  elevation?: number;
  daily?: {
    time: string[];
    temperature_2m_mean?: (number | null)[];
    temperature_2m_max?: (number | null)[];
    temperature_2m_min?: (number | null)[];
    precipitation_sum?: (number | null)[];
    wind_speed_10m_max?: (number | null)[];
    weather_code?: (number | null)[];
  };
}
