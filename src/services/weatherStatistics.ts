import { DailyWeatherRecord } from '../models/weather';
import {
  SameDayYearData,
  StatisticalSummary,
  MonthlySummaryData,
  SeasonalSummaryData,
  SeasonId,
  AnnualSummaryData,
  ClimateTrendData,
  AnomalyData,
  DecadeSummaryData,
  WeatherRecordItem,
  ActiveMetric,
} from '../models/statistics';
import {
  mean,
  median,
  min,
  max,
  standardDeviation,
  linearRegression,
  movingAverage,
  countAboveThreshold,
  countBelowThreshold,
  longestSequence,
  trendPerDecade,
} from '../utils/statistics';
import { isLeapYear, MONTH_NAMES } from '../utils/dates';

/**
 * Extracts value of active metric from a daily record
 */
export function getMetricValue(record: DailyWeatherRecord, metric: ActiveMetric): number | null {
  switch (metric) {
    case 'tempMean':
      return record.tempMean;
    case 'tempMin':
      return record.tempMin;
    case 'tempMax':
      return record.tempMax;
    case 'precipitation':
      return record.precipitation;
    case 'windSpeedMax':
      return record.windSpeedMax;
    default:
      return record.tempMean;
  }
}

/**
 * Same Day Through Years Processor
 */
export function processSameDayThroughYears(
  records: DailyWeatherRecord[],
  month: number,
  day: number,
  metric: ActiveMetric = 'tempMean'
): {
  data: SameDayYearData[];
  summary: StatisticalSummary;
} {
  // If Feb 29 selected, strictly include ONLY leap years
  const isFeb29 = month === 2 && day === 29;

  const filtered = records.filter((r) => {
    if (r.month !== month) return false;
    if (isFeb29) {
      return r.day === 29 && isLeapYear(r.year);
    }
    return r.day === day;
  });

  // Sort by year ascending
  filtered.sort((a, b) => a.year - b.year);

  // Map to SameDayYearData
  const rawData: SameDayYearData[] = filtered.map((r) => ({
    year: r.year,
    date: r.date,
    tempMean: r.tempMean,
    tempMin: r.tempMin,
    tempMax: r.tempMax,
    precipitation: r.precipitation,
    windSpeedMax: r.windSpeedMax,
  }));

  // Linear regression on active metric
  const points = rawData
    .map((d) => ({
      x: d.year,
      y: getMetricValue(d as any, metric) ?? NaN,
    }))
    .filter((p) => !isNaN(p.y));

  const reg = linearRegression(points);

  const dataWithTrend = rawData.map((d) => {
    const val = getMetricValue(d as any, metric);
    let trendVal: number | null = null;
    if (reg) {
      trendVal = reg.intercept + reg.slope * d.year;
    }
    return {
      ...d,
      trendVal,
    };
  });

  // Summary statistics
  const metricValues = rawData.map((d) => getMetricValue(d as any, metric));
  const avg = mean(metricValues);
  const med = median(metricValues);
  const minVal = min(metricValues);
  const maxVal = max(metricValues);
  const std = standardDeviation(metricValues);

  let warmestYr: { year: number; value: number } | undefined;
  let coldestYr: { year: number; value: number } | undefined;

  rawData.forEach((d) => {
    const val = getMetricValue(d as any, metric);
    if (val !== null) {
      if (!warmestYr || val > warmestYr.value) {
        warmestYr = { year: d.year, value: val };
      }
      if (!coldestYr || val < coldestYr.value) {
        coldestYr = { year: d.year, value: val };
      }
    }
  });

  const firstVal = metricValues.find((v) => v !== null);
  const lastVal = [...metricValues].reverse().find((v) => v !== null);
  const variationTotal =
    firstVal !== undefined && lastVal !== undefined && firstVal !== null && lastVal !== null
      ? lastVal - firstVal
      : undefined;

  const summary: StatisticalSummary = {
    count: rawData.length,
    mean: avg,
    median: med,
    min: minVal,
    max: maxVal,
    stdDev: std,
    warmestYear: warmestYr,
    coldestYear: coldestYr,
    variationTotal,
    trendPerDecade: reg ? trendPerDecade(reg.slope) ?? undefined : undefined,
    linearSlope: reg?.slope,
    linearIntercept: reg?.intercept,
  };

  return { data: dataWithTrend, summary };
}

/**
 * Monthly Analysis Processor
 */
export function processMonthlyAnalysis(
  records: DailyWeatherRecord[],
  month: number
): MonthlySummaryData[] {
  // Group records by year
  const yearMap = new Map<number, DailyWeatherRecord[]>();
  records.forEach((r) => {
    if (r.month === month) {
      if (!yearMap.has(r.year)) yearMap.set(r.year, []);
      yearMap.get(r.year)!.push(r);
    }
  });

  const years = Array.from(yearMap.keys()).sort((a, b) => a - b);
  const result: MonthlySummaryData[] = [];

  years.forEach((yr) => {
    const recs = yearMap.get(yr)!;
    const tempMeans = recs.map((r) => r.tempMean);
    const tempMins = recs.map((r) => r.tempMin);
    const tempMaxs = recs.map((r) => r.tempMax);
    const precips = recs.map((r) => r.precipitation);

    const tempMeanVal = mean(tempMeans);
    const tempMinMeanVal = mean(tempMins);
    const tempMaxMeanVal = mean(tempMaxs);

    const validPrecips = precips.filter((p): p is number => p !== null && p !== undefined);
    const precipTotalVal = validPrecips.reduce((sum, p) => sum + p, 0);
    const rainyDaysCount = validPrecips.filter((p) => p >= 0.1).length;

    let tempMaxAbs: number | null = null;
    let tempMaxAbsDate: string | undefined;

    recs.forEach((r) => {
      if (r.tempMax !== null && (tempMaxAbs === null || r.tempMax > tempMaxAbs)) {
        tempMaxAbs = r.tempMax;
        tempMaxAbsDate = r.date;
      }
    });

    result.push({
      year: yr,
      month,
      monthName: MONTH_NAMES[month - 1],
      tempMean: tempMeanVal,
      tempMinMean: tempMinMeanVal,
      tempMaxMean: tempMaxMeanVal,
      precipTotal: precipTotalVal,
      rainyDaysCount,
      tempMaxAbs,
      tempMaxAbsDate,
    });
  });

  return result;
}

const SEASON_METADATA: Record<SeasonId, { name: string; months: number[] }> = {
  winter: { name: 'Winter', months: [12, 1, 2] },
  spring: { name: 'Spring', months: [3, 4, 5] },
  summer: { name: 'Summer', months: [6, 7, 8] },
  autumn: { name: 'Autumn', months: [9, 10, 11] },
};

function getSeasonYear(record: DailyWeatherRecord, season: SeasonId): number {
  // A winter is identified by the year in which it ends:
  // December 2023 + January/February 2024 => winter 2023/24 (year 2024).
  if (season === 'winter' && record.month === 12) return record.year + 1;
  return record.year;
}

function getSeasonBounds(season: SeasonId, year: number): { start: string; end: string; days: number } {
  switch (season) {
    case 'winter': {
      const februaryDays = isLeapYear(year) ? 29 : 28;
      return {
        start: `${year - 1}-12-01`,
        end: `${year}-02-${februaryDays}`,
        days: 31 + 31 + februaryDays,
      };
    }
    case 'spring':
      return { start: `${year}-03-01`, end: `${year}-05-31`, days: 92 };
    case 'summer':
      return { start: `${year}-06-01`, end: `${year}-08-31`, days: 92 };
    case 'autumn':
      return { start: `${year}-09-01`, end: `${year}-11-30`, days: 91 };
  }
}

function getSeasonPeriodLabel(season: SeasonId, year: number): string {
  if (season !== 'winter') return String(year);
  return `${year - 1}/${String(year).slice(-2)}`;
}

/**
 * Groups daily records into meteorological seasons and calculates comparable
 * temperature and precipitation summaries. Incomplete seasons are excluded by
 * default so a partial current season is not compared with complete past ones.
 */
export function processSeasonalAnalysis(
  records: DailyWeatherRecord[],
  season: SeasonId,
  includeIncomplete: boolean = false
): SeasonalSummaryData[] {
  const metadata = SEASON_METADATA[season];
  const yearMap = new Map<number, DailyWeatherRecord[]>();

  records.forEach((record) => {
    if (!metadata.months.includes(record.month)) return;
    const seasonYear = getSeasonYear(record, season);
    if (!yearMap.has(seasonYear)) yearMap.set(seasonYear, []);
    yearMap.get(seasonYear)!.push(record);
  });

  return Array.from(yearMap.entries())
    .sort(([yearA], [yearB]) => yearA - yearB)
    .flatMap(([year, seasonRecords]) => {
      const bounds = getSeasonBounds(season, year);
      const uniqueDates = new Set(seasonRecords.map((record) => record.date));
      const isComplete =
        uniqueDates.size >= bounds.days && uniqueDates.has(bounds.start) && uniqueDates.has(bounds.end);

      if (!includeIncomplete && !isComplete) return [];

      const tempMeans = seasonRecords.map((record) => record.tempMean);
      const tempMins = seasonRecords.map((record) => record.tempMin);
      const tempMaxs = seasonRecords.map((record) => record.tempMax);
      const validPrecip = seasonRecords
        .map((record) => record.precipitation)
        .filter((value): value is number => value !== null && value !== undefined);

      let tempMinAbs: number | null = null;
      let tempMinAbsDate: string | undefined;
      seasonRecords.forEach((record) => {
        if (record.tempMin !== null && (tempMinAbs === null || record.tempMin < tempMinAbs)) {
          tempMinAbs = record.tempMin;
          tempMinAbsDate = record.date;
        }
      });

      return [
        {
          year,
          season,
          seasonName: metadata.name,
          periodLabel: getSeasonPeriodLabel(season, year),
          tempMean: mean(tempMeans),
          tempMinMean: mean(tempMins),
          tempMaxMean: mean(tempMaxs),
          tempMinAbs,
          tempMinAbsDate,
          precipTotal:
            validPrecip.length > 0 ? validPrecip.reduce((total, value) => total + value, 0) : null,
          rainyDaysCount: validPrecip.filter((value) => value >= 0.1).length,
          observedDays: uniqueDates.size,
          isComplete,
        },
      ];
    });
}

/**
 * Annual Analysis Processor
 */
export function processAnnualAnalysis(records: DailyWeatherRecord[]): AnnualSummaryData[] {
  const yearMap = new Map<number, DailyWeatherRecord[]>();
  records.forEach((r) => {
    if (!yearMap.has(r.year)) yearMap.set(r.year, []);
    yearMap.get(r.year)!.push(r);
  });

  const years = Array.from(yearMap.keys()).sort((a, b) => a - b);
  const result: AnnualSummaryData[] = [];

  years.forEach((yr) => {
    const recs = yearMap.get(yr)!;
    const tempMeans = recs.map((r) => r.tempMean);
    const tempMins = recs.map((r) => r.tempMin);
    const tempMaxs = recs.map((r) => r.tempMax);
    const precips = recs.map((r) => r.precipitation);

    const tempMeanVal = mean(tempMeans);
    const tempMinMeanVal = mean(tempMins);
    const tempMaxMeanVal = mean(tempMaxs);

    const validPrecips = precips.filter((p): p is number => p !== null && p !== undefined);
    const precipTotalVal = validPrecips.reduce((sum, p) => sum + p, 0);
    const precipDaysCount = validPrecips.filter((p) => p >= 0.1).length;

    let hottest: { date: string; temp: number } | undefined;
    let coldest: { date: string; temp: number } | undefined;

    recs.forEach((r) => {
      if (r.tempMax !== null && (!hottest || r.tempMax > hottest.temp)) {
        hottest = { date: r.date, temp: r.tempMax };
      }
      if (r.tempMin !== null && (!coldest || r.tempMin < coldest.temp)) {
        coldest = { date: r.date, temp: r.tempMin };
      }
    });

    const daysAbove30 = countAboveThreshold(tempMaxs, 30);
    const daysAbove35 = countAboveThreshold(tempMaxs, 35);
    const daysBelow0 = countBelowThreshold(tempMins, 0);

    result.push({
      year: yr,
      tempMean: tempMeanVal,
      tempMinMean: tempMinMeanVal,
      tempMaxMean: tempMaxMeanVal,
      precipTotal: precipTotalVal,
      hottestDay: hottest,
      coldestDay: coldest,
      daysAbove30,
      daysAbove35,
      daysBelow0,
      precipDaysCount,
    });
  });

  return result;
}

/**
 * Weather Records Processor
 */
export function processWeatherRecords(
  records: DailyWeatherRecord[],
  startYear: number,
  endYear: number
): WeatherRecordItem[] {
  if (records.length === 0) return [];

  let highestTemp: { temp: number; date: string } | null = null;
  let lowestTemp: { temp: number; date: string } | null = null;
  let wettestDay: { precip: number; date: string } | null = null;

  records.forEach((r) => {
    if (r.tempMax !== null && (!highestTemp || r.tempMax > highestTemp.temp)) {
      highestTemp = { temp: r.tempMax, date: r.date };
    }
    if (r.tempMin !== null && (!lowestTemp || r.tempMin < lowestTemp.temp)) {
      lowestTemp = { temp: r.tempMin, date: r.date };
    }
    if (r.precipitation !== null && (!wettestDay || r.precipitation > wettestDay.precip)) {
      wettestDay = { precip: r.precipitation, date: r.date };
    }
  });

  // Annual analysis for yearly records
  const annuals = processAnnualAnalysis(records);

  let warmestYear: { year: number; temp: number } | null = null;
  let coldestYear: { year: number; temp: number } | null = null;
  let mostDays30: { year: number; count: number } | null = null;
  let mostDays35: { year: number; count: number } | null = null;

  annuals.forEach((a) => {
    if (a.tempMean !== null) {
      if (!warmestYear || a.tempMean > warmestYear.temp) {
        warmestYear = { year: a.year, temp: a.tempMean };
      }
      if (!coldestYear || a.tempMean < coldestYear.temp) {
        coldestYear = { year: a.year, temp: a.tempMean };
      }
    }
    if (!mostDays30 || a.daysAbove30 > mostDays30.count) {
      mostDays30 = { year: a.year, count: a.daysAbove30 };
    }
    if (!mostDays35 || a.daysAbove35 > mostDays35.count) {
      mostDays35 = { year: a.year, count: a.daysAbove35 };
    }
  });

  // Monthly totals for wettest/warmest month
  const monthMap = new Map<string, { year: number; month: number; recs: DailyWeatherRecord[] }>();
  records.forEach((r) => {
    const key = `${r.year}-${r.month}`;
    if (!monthMap.has(key)) {
      monthMap.set(key, { year: r.year, month: r.month, recs: [] });
    }
    monthMap.get(key)!.recs.push(r);
  });

  let wettestMonth: { year: number; month: number; total: number } | null = null;
  let warmestMonth: { year: number; month: number; temp: number } | null = null;
  let coldestMonth: { year: number; month: number; temp: number } | null = null;

  monthMap.forEach((val) => {
    const precips = val.recs.map((r) => r.precipitation).filter((p): p is number => p !== null);
    const sumPrecip = precips.reduce((a, b) => a + b, 0);
    if (!wettestMonth || sumPrecip > wettestMonth.total) {
      wettestMonth = { year: val.year, month: val.month, total: sumPrecip };
    }

    const tempMeans = val.recs.map((r) => r.tempMean);
    const avgTemp = mean(tempMeans);
    if (avgTemp !== null) {
      if (!warmestMonth || avgTemp > warmestMonth.temp) {
        warmestMonth = { year: val.year, month: val.month, temp: avgTemp };
      }
      if (!coldestMonth || avgTemp < coldestMonth.temp) {
        coldestMonth = { year: val.year, month: val.month, temp: avgTemp };
      }
    }
  });

  // Longest Dry Period
  const precipSeries = records.map((r) => r.precipitation);
  const longestDryDays = longestSequence(precipSeries, (p) => p < 0.1);

  const periodText = `Selected period: ${startYear}–${endYear}`;

  const items: WeatherRecordItem[] = [];

  if (highestTemp) {
    items.push({
      id: 'highest_temp',
      title: 'Highest Temperature',
      value: `${(highestTemp as { temp: number; date: string }).temp.toFixed(1)} °C`,
      subtext: `Recorded on ${(highestTemp as { temp: number; date: string }).date}`,
      category: 'temperature',
    });
  }

  if (lowestTemp) {
    items.push({
      id: 'lowest_temp',
      title: 'Lowest Temperature',
      value: `${(lowestTemp as { temp: number; date: string }).temp.toFixed(1)} °C`,
      subtext: `Recorded on ${(lowestTemp as { temp: number; date: string }).date}`,
      category: 'temperature',
    });
  }

  if (wettestDay) {
    items.push({
      id: 'wettest_day',
      title: 'Wettest Day',
      value: `${(wettestDay as { precip: number; date: string }).precip.toFixed(1)} mm`,
      subtext: `Recorded on ${(wettestDay as { precip: number; date: string }).date}`,
      category: 'precipitation',
    });
  }

  if (wettestMonth) {
    const wm = wettestMonth as { year: number; month: number; total: number };
    items.push({
      id: 'wettest_month',
      title: 'Wettest Month',
      value: `${wm.total.toFixed(1)} mm`,
      subtext: `${MONTH_NAMES[wm.month - 1]} ${wm.year}`,
      category: 'precipitation',
    });
  }

  if (warmestYear) {
    const wy = warmestYear as { year: number; temp: number };
    items.push({
      id: 'warmest_year',
      title: 'Warmest Year',
      value: `${wy.temp.toFixed(1)} °C avg`,
      subtext: `Year ${wy.year}`,
      category: 'temperature',
    });
  }

  if (coldestYear) {
    const cy = coldestYear as { year: number; temp: number };
    items.push({
      id: 'coldest_year',
      title: 'Coldest Year',
      value: `${cy.temp.toFixed(1)} °C avg`,
      subtext: `Year ${cy.year}`,
      category: 'temperature',
    });
  }

  if (warmestMonth) {
    const wm = warmestMonth as { year: number; month: number; temp: number };
    items.push({
      id: 'warmest_month',
      title: 'Warmest Month',
      value: `${wm.temp.toFixed(1)} °C avg`,
      subtext: `${MONTH_NAMES[wm.month - 1]} ${wm.year}`,
      category: 'temperature',
    });
  }

  if (coldestMonth) {
    const cm = coldestMonth as { year: number; month: number; temp: number };
    items.push({
      id: 'coldest_month',
      title: 'Coldest Month',
      value: `${cm.temp.toFixed(1)} °C avg`,
      subtext: `${MONTH_NAMES[cm.month - 1]} ${cm.year}`,
      category: 'temperature',
    });
  }

  items.push({
    id: 'dry_streak',
    title: 'Longest Dry Period',
    value: `${longestDryDays} days`,
    subtext: `Consecutive days with < 0.1 mm rain (${periodText})`,
    category: 'duration',
  });

  if (mostDays30) {
    const md = mostDays30 as { year: number; count: number };
    items.push({
      id: 'most_days_30',
      title: 'Most Days Above 30 °C',
      value: `${md.count} days`,
      subtext: `In year ${md.year}`,
      category: 'counts',
    });
  }

  if (mostDays35) {
    const md = mostDays35 as { year: number; count: number };
    items.push({
      id: 'most_days_35',
      title: 'Most Days Above 35 °C',
      value: `${md.count} days`,
      subtext: `In year ${md.year}`,
      category: 'counts',
    });
  }

  return items;
}

/**
 * Climate Trends Processor
 */
export function processClimateTrends(
  records: DailyWeatherRecord[],
  metric: ActiveMetric = 'tempMean'
): {
  trends: ClimateTrendData[];
  linearSlope: number | null;
  linearIntercept: number | null;
  trendPerDecadeVal: number | null;
} {
  const annuals = processAnnualAnalysis(records);
  const rawValues: (number | null)[] = [];
  const points: { x: number; y: number }[] = [];

  annuals.forEach((a) => {
    let val: number | null = null;
    if (metric === 'tempMean') val = a.tempMean;
    else if (metric === 'tempMin') val = a.tempMinMean;
    else if (metric === 'tempMax') val = a.tempMaxMean;
    else if (metric === 'precipitation') val = a.precipTotal;

    rawValues.push(val);
    if (val !== null) {
      points.push({ x: a.year, y: val });
    }
  });

  const reg = linearRegression(points);
  const ma5 = movingAverage(rawValues, 5);
  const ma10 = movingAverage(rawValues, 10);

  const trends: ClimateTrendData[] = annuals.map((a, idx) => {
    const val = rawValues[idx];
    let trendLine: number | null = null;
    if (reg) {
      trendLine = reg.intercept + reg.slope * a.year;
    }
    return {
      year: a.year,
      value: val,
      ma5: ma5[idx],
      ma10: ma10[idx],
      trendLine,
    };
  });

  return {
    trends,
    linearSlope: reg?.slope ?? null,
    linearIntercept: reg?.intercept ?? null,
    trendPerDecadeVal: reg ? trendPerDecade(reg.slope) : null,
  };
}

/**
 * Anomalies Processor vs Baseline
 */
export function processAnomalies(
  records: DailyWeatherRecord[],
  baselineStartYear: number,
  baselineEndYear: number,
  metric: ActiveMetric = 'tempMean'
): {
  baselineMean: number | null;
  anomalies: AnomalyData[];
} {
  const annuals = processAnnualAnalysis(records);

  // Extract baseline records
  const baselineAnnuals = annuals.filter((a) => a.year >= baselineStartYear && a.year <= baselineEndYear);
  const baselineVals = baselineAnnuals
    .map((a) => {
      if (metric === 'tempMean') return a.tempMean;
      if (metric === 'tempMin') return a.tempMinMean;
      if (metric === 'tempMax') return a.tempMaxMean;
      if (metric === 'precipitation') return a.precipTotal;
      return a.tempMean;
    })
    .filter((v): v is number => v !== null);

  const baseMean = mean(baselineVals);
  if (baseMean === null) {
    return { baselineMean: null, anomalies: [] };
  }

  const anomalies: AnomalyData[] = annuals.map((a) => {
    let val: number | null = null;
    if (metric === 'tempMean') val = a.tempMean;
    else if (metric === 'tempMin') val = a.tempMinMean;
    else if (metric === 'tempMax') val = a.tempMaxMean;
    else if (metric === 'precipitation') val = a.precipTotal;

    const actualVal = val ?? baseMean;
    return {
      year: a.year,
      value: actualVal,
      baselineMean: baseMean,
      anomaly: actualVal - baseMean,
    };
  });

  return {
    baselineMean: baseMean,
    anomalies,
  };
}

/**
 * Decade Comparison Processor
 */
export function processDecadeComparison(records: DailyWeatherRecord[]): DecadeSummaryData[] {
  const annuals = processAnnualAnalysis(records);
  const decadeMap = new Map<number, AnnualSummaryData[]>();

  annuals.forEach((a) => {
    const decadeStart = Math.floor(a.year / 10) * 10;
    if (!decadeMap.has(decadeStart)) {
      decadeMap.set(decadeStart, []);
    }
    decadeMap.get(decadeStart)!.push(a);
  });

  const sortedDecades = Array.from(decadeMap.keys()).sort((a, b) => a - b);
  const result: DecadeSummaryData[] = [];

  sortedDecades.forEach((dStart) => {
    const items = decadeMap.get(dStart)!;
    const endYear = dStart + 9;
    const label = `${dStart}s`;

    const tempMeans = items.map((i) => i.tempMean);
    const tempMins = items.map((i) => i.tempMinMean);
    const tempMaxs = items.map((i) => i.tempMaxMean);
    const precips = items.map((i) => i.precipTotal);

    const dTempMean = mean(tempMeans);
    const dTempMin = mean(tempMins);
    const dTempMax = mean(tempMaxs);

    const validPrecips = precips.filter((p): p is number => p !== null);
    const dPrecipTotal = validPrecips.length > 0 ? validPrecips.reduce((a, b) => a + b, 0) / validPrecips.length : null;

    const days30Total = items.reduce((sum, i) => sum + i.daysAbove30, 0);
    const days35Total = items.reduce((sum, i) => sum + i.daysAbove35, 0);

    result.push({
      decadeLabel: label,
      startYear: dStart,
      endYear,
      tempMean: dTempMean,
      tempMinMean: dTempMin,
      tempMaxMean: dTempMax,
      precipTotal: dPrecipTotal, // Average annual precipitation in that decade
      daysAbove30: Math.round(days30Total / items.length), // Avg days per year
      daysAbove35: Math.round(days35Total / items.length),
    });
  });

  return result;
}
