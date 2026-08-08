import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  CloudSun,
  LineChart as ChartIcon,
  RefreshCw,
  Snowflake,
  Sprout,
  Sun,
  Table,
  Trees,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getHistoricalWeather } from '../services/weatherApi';
import { processSeasonalAnalysis } from '../services/weatherStatistics';
import { HistoricalDataResult } from '../models/weather';
import { SeasonId, SeasonalSummaryData } from '../models/statistics';
import { getCurrentYear, getMaxHistoricalDate, isLeapYear } from '../utils/dates';
import { formatPrecip, formatTemp } from '../utils/units';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { WeatherLineChart } from '../charts/WeatherLineChart';
import { ColumnDef, DataTable } from '../components/DataTable';

interface SeasonalAnalysisScreenProps {
  onBack: () => void;
}

const SEASONS: Array<{
  id: SeasonId;
  name: string;
  months: string;
  icon: React.ReactNode;
}> = [
  { id: 'winter', name: 'Winter', months: 'Dec – Feb', icon: <Snowflake className="w-4 h-4" /> },
  { id: 'spring', name: 'Spring', months: 'Mar – May', icon: <Sprout className="w-4 h-4" /> },
  { id: 'summer', name: 'Summer', months: 'Jun – Aug', icon: <Sun className="w-4 h-4" /> },
  { id: 'autumn', name: 'Autumn', months: 'Sep – Nov', icon: <Trees className="w-4 h-4" /> },
];

function getRequestedDateRange(season: SeasonId, startYear: number, endYear: number) {
  const start =
    season === 'winter'
      ? `${startYear - 1}-12-01`
      : season === 'spring'
        ? `${startYear}-03-01`
        : season === 'summer'
          ? `${startYear}-06-01`
          : `${startYear}-09-01`;

  const end =
    season === 'winter'
      ? `${endYear}-02-${isLeapYear(endYear) ? '29' : '28'}`
      : season === 'spring'
        ? `${endYear}-05-31`
        : season === 'summer'
          ? `${endYear}-08-31`
          : `${endYear}-11-30`;

  const maxHistoricalDate = getMaxHistoricalDate();
  return { start, end: end < maxHistoricalDate ? end : maxHistoricalDate };
}

export const SeasonalAnalysisScreen: React.FC<SeasonalAnalysisScreenProps> = ({ onBack }) => {
  const { location, settings } = useApp();
  const currentYear = getCurrentYear();
  const minimumYear = 1941; // Winter 1940 would require unavailable December 1939 data.

  const [season, setSeason] = useState<SeasonId>('winter');
  const [startYear, setStartYear] = useState<number>(1980);
  const [endYear, setEndYear] = useState<number>(currentYear);
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [rawHistory, setRawHistory] = useState<HistoricalDataResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const selectedSeason = SEASONS.find((item) => item.id === season)!;

  const fetchData = async (forceRefresh: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const { start, end } = getRequestedDateRange(season, startYear, endYear);
      const data = await getHistoricalWeather(location, start, end, forceRefresh);
      setRawHistory(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch seasonal historical data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(false);
  }, [location, season, startYear, endYear]);

  const seasonalData = useMemo(() => {
    if (!rawHistory) return [];
    return processSeasonalAnalysis(rawHistory.records, season).filter(
      (item) => item.year >= startYear && item.year <= endYear
    );
  }, [rawHistory, season, startYear, endYear]);

  const columns: ColumnDef<SeasonalSummaryData>[] = [
    { key: 'year', header: 'Period', accessor: (item) => item.periodLabel },
    {
      key: 'tempMean',
      header: 'Mean Temp',
      accessor: (item) => item.tempMean,
      format: (value) => formatTemp(value, settings.tempUnit),
      align: 'right',
    },
    {
      key: 'tempMinMean',
      header: 'Avg Min',
      accessor: (item) => item.tempMinMean,
      format: (value) => formatTemp(value, settings.tempUnit),
      align: 'right',
    },
    {
      key: 'tempMinAbs',
      header: 'Lowest Min',
      accessor: (item) => item.tempMinAbs,
      format: (value, item) =>
        `${formatTemp(value, settings.tempUnit)}${item.tempMinAbsDate ? ` (${item.tempMinAbsDate})` : ''}`,
      align: 'right',
    },
    {
      key: 'tempMaxMean',
      header: 'Avg Max',
      accessor: (item) => item.tempMaxMean,
      format: (value) => formatTemp(value, settings.tempUnit),
      align: 'right',
    },
    {
      key: 'precipTotal',
      header: 'Rain Total',
      accessor: (item) => item.precipTotal,
      format: (value) => formatPrecip(value, settings.precipUnit),
      align: 'right',
    },
    {
      key: 'rainyDaysCount',
      header: 'Rainy Days',
      accessor: (item) => item.rainyDaysCount,
      align: 'right',
    },
  ];

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            aria-label="Back to analytical tools"
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Seasonal Comparison</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Compare complete meteorological seasons across years for {location.name}
            </p>
          </div>
        </div>
        <button
          onClick={() => fetchData(true)}
          title="Refresh Open-Meteo Data"
          aria-label="Refresh Open-Meteo data"
          className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-700/80 space-y-3 shadow-xs">
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <CloudSun className="w-4 h-4 text-sky-500" />
          <span>Select Season & Year Interval</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SEASONS.map((item) => (
            <button
              key={item.id}
              onClick={() => setSeason(item.id)}
              className={`rounded-xl border px-3 py-2 text-left transition-colors cursor-pointer ${
                season === item.id
                  ? 'border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-sky-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
              }`}
            >
              <span className="flex items-center gap-1.5 text-xs font-bold">
                {item.icon}
                {item.name}
              </span>
              <span className="mt-0.5 block text-[10px] opacity-70">{item.months}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="block text-[10px] text-slate-400 font-medium mb-1">Start Year</label>
            <select
              value={startYear}
              onChange={(event) => setStartYear(parseInt(event.target.value, 10))}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5 text-slate-900 dark:text-white font-medium"
            >
              {Array.from({ length: currentYear - minimumYear + 1 }, (_, index) => minimumYear + index).map(
                (year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 font-medium mb-1">End Year</label>
            <select
              value={endYear}
              onChange={(event) => setEndYear(parseInt(event.target.value, 10))}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5 text-slate-900 dark:text-white font-medium"
            >
              {Array.from({ length: currentYear - startYear + 1 }, (_, index) => startYear + index).map(
                (year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {season === 'winter' && (
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            Winter uses its ending year: 2023/24 includes December 2023 and January–February 2024.
          </p>
        )}
      </div>

      {loading ? (
        <LoadingState
          message={`Comparing complete ${selectedSeason.name.toLowerCase()} seasons (${startYear}–${endYear})...`}
        />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchData(true)} />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {selectedSeason.name} temperature comparison ({startYear} → {endYear})
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Partial seasons are excluded from the comparison.
              </p>
            </div>
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('chart')}
                aria-label="Show chart"
                className={`p-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                  viewMode === 'chart'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-2xs'
                    : 'text-slate-500'
                }`}
              >
                <ChartIcon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                aria-label="Show table"
                className={`p-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-2xs'
                    : 'text-slate-500'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {viewMode === 'chart' ? (
            <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
              <WeatherLineChart
                data={seasonalData}
                xKey="periodLabel"
                yKey="tempMean"
                yKeyMin="tempMinMean"
                yKeyMax="tempMaxMean"
                unitLabel={`°${settings.tempUnit}`}
                lineName="Season Mean"
                showTrendline={false}
                height={300}
              />
            </div>
          ) : (
            <DataTable
              data={seasonalData}
              columns={columns}
              defaultSortKey="year"
              defaultSortDir="desc"
              keyExtractor={(item) => `${item.season}-${item.year}`}
            />
          )}
        </div>
      )}
    </div>
  );
};
