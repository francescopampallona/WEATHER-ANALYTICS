import { TempUnit, WindUnit, PrecipUnit, AppSettings } from '../models/weather';
import { ActiveMetric } from '../models/statistics';

/**
 * Converts temperature from Celsius to target unit
 */
export function convertTemp(valC: number | null, unit: TempUnit): number | null {
  if (valC === null || valC === undefined || isNaN(valC)) return null;
  if (unit === 'F') {
    return (valC * 9) / 5 + 32;
  }
  return valC;
}

/**
 * Converts wind speed from km/h to target unit
 */
export function convertWind(valKmh: number | null, unit: WindUnit): number | null {
  if (valKmh === null || valKmh === undefined || isNaN(valKmh)) return null;
  if (unit === 'ms') {
    return valKmh / 3.6;
  }
  if (unit === 'mph') {
    return valKmh * 0.621371;
  }
  return valKmh;
}

/**
 * Converts precipitation from mm to target unit
 */
export function convertPrecip(valMm: number | null, unit: PrecipUnit): number | null {
  if (valMm === null || valMm === undefined || isNaN(valMm)) return null;
  if (unit === 'inch') {
    return valMm * 0.0393701;
  }
  return valMm;
}

/**
 * Formats temperature with unit symbol
 */
export function formatTemp(valC: number | null | undefined, unit: TempUnit = 'C', decimals: number = 1): string {
  if (valC === null || valC === undefined || isNaN(valC)) return 'N/A';
  const converted = convertTemp(valC, unit);
  if (converted === null) return 'N/A';
  const sign = converted > 0 ? '' : '';
  return `${sign}${converted.toFixed(decimals)} °${unit}`;
}

/**
 * Formats temperature delta / anomaly (+0.42 °C)
 */
export function formatTempDelta(valC: number | null | undefined, unit: TempUnit = 'C', decimals: number = 2): string {
  if (valC === null || valC === undefined || isNaN(valC)) return 'N/A';
  const factor = unit === 'F' ? 1.8 : 1.0;
  const converted = valC * factor;
  const sign = converted > 0 ? '+' : '';
  return `${sign}${converted.toFixed(decimals)} °${unit}`;
}

/**
 * Converts a metric value from the units returned by Open-Meteo to app settings.
 */
export function convertMetricValue(
  value: number | null | undefined,
  metric: ActiveMetric,
  settings: Pick<AppSettings, 'tempUnit' | 'windUnit' | 'precipUnit'>
): number | null {
  if (value === null || value === undefined || isNaN(value)) return null;
  if (metric === 'precipitation') return convertPrecip(value, settings.precipUnit);
  if (metric === 'windSpeedMax') return convertWind(value, settings.windUnit);
  return convertTemp(value, settings.tempUnit);
}

/**
 * Converts a difference/slope. Fahrenheit deltas must not receive the +32 offset.
 */
export function convertMetricDelta(
  value: number | null | undefined,
  metric: ActiveMetric,
  settings: Pick<AppSettings, 'tempUnit' | 'windUnit' | 'precipUnit'>
): number | null {
  if (value === null || value === undefined || isNaN(value)) return null;
  if (metric === 'precipitation') return convertPrecip(value, settings.precipUnit);
  if (metric === 'windSpeedMax') return convertWind(value, settings.windUnit);
  return value * (settings.tempUnit === 'F' ? 1.8 : 1);
}

export function formatMetricValue(
  value: number | null | undefined,
  metric: ActiveMetric,
  settings: Pick<AppSettings, 'tempUnit' | 'windUnit' | 'precipUnit'>,
  decimals: number = 1
): string {
  if (metric === 'precipitation') return formatPrecip(value, settings.precipUnit, decimals);
  if (metric === 'windSpeedMax') return formatWind(value, settings.windUnit, decimals);
  return formatTemp(value, settings.tempUnit, decimals);
}

export function formatMetricDelta(
  value: number | null | undefined,
  metric: ActiveMetric,
  settings: Pick<AppSettings, 'tempUnit' | 'windUnit' | 'precipUnit'>,
  decimals: number = 2
): string {
  const converted = convertMetricDelta(value, metric, settings);
  if (converted === null) return 'N/A';
  const unit = getMetricUnitLabel(metric, settings.tempUnit, settings.windUnit, settings.precipUnit);
  const sign = converted > 0 ? '+' : '';
  return `${sign}${converted.toFixed(decimals)} ${unit}`;
}

/**
 * Formats wind speed
 */
export function formatWind(valKmh: number | null | undefined, unit: WindUnit = 'kmh', decimals: number = 1): string {
  if (valKmh === null || valKmh === undefined || isNaN(valKmh)) return 'N/A';
  const converted = convertWind(valKmh, unit);
  if (converted === null) return 'N/A';
  const label = unit === 'kmh' ? 'km/h' : unit === 'ms' ? 'm/s' : 'mph';
  return `${converted.toFixed(decimals)} ${label}`;
}

/**
 * Formats precipitation
 */
export function formatPrecip(valMm: number | null | undefined, unit: PrecipUnit = 'mm', decimals: number = 1): string {
  if (valMm === null || valMm === undefined || isNaN(valMm)) return 'N/A';
  const converted = convertPrecip(valMm, unit);
  if (converted === null) return 'N/A';
  const label = unit === 'mm' ? 'mm' : 'in';
  return `${converted.toFixed(decimals)} ${label}`;
}

/**
 * Returns label for active metric symbol
 */
export function getMetricUnitLabel(
  metric: 'tempMean' | 'tempMin' | 'tempMax' | 'precipitation' | 'windSpeedMax',
  tempUnit: TempUnit,
  windUnit: WindUnit,
  precipUnit: PrecipUnit
): string {
  switch (metric) {
    case 'tempMean':
    case 'tempMin':
    case 'tempMax':
      return `°${tempUnit}`;
    case 'precipitation':
      return precipUnit === 'mm' ? 'mm' : 'in';
    case 'windSpeedMax':
      return windUnit === 'kmh' ? 'km/h' : windUnit === 'ms' ? 'm/s' : 'mph';
  }
}
