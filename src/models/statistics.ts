export type ActiveMetric = 'tempMean' | 'tempMin' | 'tempMax' | 'precipitation' | 'windSpeedMax';

export interface StatisticalSummary {
  count: number;
  mean: number | null;
  median: number | null;
  min: number | null;
  max: number | null;
  stdDev: number | null;
  minYear?: number;
  maxYear?: number;
  minDate?: string;
  maxDate?: string;
  warmestYear?: { year: number; value: number };
  coldestYear?: { year: number; value: number };
  variationTotal?: number;
  trendPerDecade?: number; // e.g. +0.42 °C / decade
  linearSlope?: number;
  linearIntercept?: number;
}

export interface SameDayYearData {
  year: number;
  date: string;
  tempMean: number | null;
  tempMin: number | null;
  tempMax: number | null;
  precipitation: number | null;
  windSpeedMax: number | null;
  trendVal?: number | null;
}

export interface MonthlySummaryData {
  year: number;
  month: number;
  monthName: string;
  tempMean: number | null;
  tempMinMean: number | null;
  tempMaxMean: number | null;
  precipTotal: number | null;
  rainyDaysCount: number;
  tempMaxAbs: number | null;
  tempMaxAbsDate?: string;
}

export interface AnnualSummaryData {
  year: number;
  tempMean: number | null;
  tempMinMean: number | null;
  tempMaxMean: number | null;
  precipTotal: number | null;
  hottestDay?: { date: string; temp: number };
  coldestDay?: { date: string; temp: number };
  daysAbove30: number;
  daysAbove35: number;
  daysBelow0: number;
  precipDaysCount: number;
}

export interface ClimateTrendData {
  year: number;
  value: number | null;
  ma5: number | null;
  ma10: number | null;
  trendLine: number | null;
}

export interface AnomalyData {
  year: number;
  value: number;
  baselineMean: number;
  anomaly: number; // year value - baseline
}

export interface DecadeSummaryData {
  decadeLabel: string; // e.g., "1980s", "1990s"
  startYear: number;
  endYear: number;
  tempMean: number | null;
  tempMinMean: number | null;
  tempMaxMean: number | null;
  precipTotal: number | null;
  daysAbove30: number;
  daysAbove35: number;
}

export interface WeatherRecordItem {
  id: string;
  title: string;
  value: string;
  subtext: string;
  dateOrYear?: string;
  category: 'temperature' | 'precipitation' | 'duration' | 'counts';
}

export interface CompareSeriesData {
  timeLabel: string; // Year, Month, or Date
  loc1Value: number | null;
  loc2Value: number | null;
  difference: number | null;
  loc1Trend?: number | null;
  loc2Trend?: number | null;
}
