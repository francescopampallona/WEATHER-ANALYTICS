import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, BarChart3, RefreshCw, Table, LineChart as ChartIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getHistoricalWeather } from '../services/weatherApi';
import { processMonthlyAnalysis } from '../services/weatherStatistics';
import { HistoricalDataResult } from '../models/weather';
import { MonthlySummaryData } from '../models/statistics';
import { MONTH_NAMES, clampToMaxHistoricalDate, getCurrentYear, getMonthEndDate, pad2 } from '../utils/dates';
import { convertTemp, formatTemp, formatPrecip } from '../utils/units';
import { MetricCard } from '../components/MetricCard';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { WeatherLineChart } from '../charts/WeatherLineChart';
import { DataTable, ColumnDef } from '../components/DataTable';

interface MonthlyAnalysisScreenProps {
  onBack: () => void;
}

export const MonthlyAnalysisScreen: React.FC<MonthlyAnalysisScreenProps> = ({ onBack }) => {
  const { location, settings } = useApp();
  const currentYear = getCurrentYear();

  const [month, setMonth] = useState<number>(8); // August
  const [startYear, setStartYear] = useState<number>(1980);
  const [endYear, setEndYear] = useState<number>(currentYear);
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  const [rawHistory, setRawHistory] = useState<HistoricalDataResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (forceRefresh: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const startStr = `${startYear}-${pad2(month)}-01`;
      const endStr = clampToMaxHistoricalDate(getMonthEndDate(endYear, month));
      if (startStr > endStr) {
        throw new Error('No historical data is available yet for the selected month and year range.');
      }

      const data = await getHistoricalWeather(location, startStr, endStr, forceRefresh);
      setRawHistory(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch monthly historical data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(false);
  }, [location, month, startYear, endYear]);

  const monthlyData = useMemo(() => {
    if (!rawHistory) return [];
    return processMonthlyAnalysis(rawHistory.records, month);
  }, [rawHistory, month]);

  const columns: ColumnDef<MonthlySummaryData>[] = [
    { key: 'year', header: 'Year', accessor: (d) => d.year },
    {
      key: 'tempMean',
      header: 'Mean Temp',
      accessor: (d) => d.tempMean,
      format: (val) => formatTemp(val, settings.tempUnit),
      align: 'right',
    },
    {
      key: 'tempMinMean',
      header: 'Avg Min',
      accessor: (d) => d.tempMinMean,
      format: (val) => formatTemp(val, settings.tempUnit),
      align: 'right',
    },
    {
      key: 'tempMaxMean',
      header: 'Avg Max',
      accessor: (d) => d.tempMaxMean,
      format: (val) => formatTemp(val, settings.tempUnit),
      align: 'right',
    },
    {
      key: 'tempMaxAbs',
      header: 'Peak Max',
      accessor: (d) => d.tempMaxAbs,
      format: (val) => formatTemp(val, settings.tempUnit),
      align: 'right',
    },
    {
      key: 'precipTotal',
      header: 'Rain Total',
      accessor: (d) => d.precipTotal,
      format: (val) => formatPrecip(val, settings.precipUnit),
      align: 'right',
    },
    { key: 'rainyDaysCount', header: 'Rainy Days', accessor: (d) => d.rainyDaysCount, align: 'right' },
  ];

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Monthly Analysis</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Track month-by-month averages across decades for {location.name}</p>
          </div>
        </div>
        <button
          onClick={() => fetchData(true)}
          title="Refresh Open-Meteo Data"
          className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-700/80 space-y-2 shadow-xs">
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <BarChart3 className="w-4 h-4 text-indigo-500" />
          <span>Select Month & Year Interval</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <label className="block text-[10px] text-slate-400 font-medium mb-1">Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value, 10))}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5 text-slate-900 dark:text-white font-medium"
            >
              {MONTH_NAMES.map((m, idx) => (
                <option key={m} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 font-medium mb-1">Start Year</label>
            <select
              value={startYear}
              onChange={(e) => setStartYear(parseInt(e.target.value, 10))}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5 text-slate-900 dark:text-white font-medium"
            >
              {Array.from({ length: currentYear - 1940 + 1 }, (_, i) => 1940 + i).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 font-medium mb-1">End Year</label>
            <select
              value={endYear}
              onChange={(e) => setEndYear(parseInt(e.target.value, 10))}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5 text-slate-900 dark:text-white font-medium"
            >
              {Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingState message={`Analyzing ${MONTH_NAMES[month - 1]} weather records (${startYear}–${endYear})...`} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchData(true)} />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {MONTH_NAMES[month - 1]} Trends ({startYear} → {endYear})
            </span>
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('chart')}
                className={`p-1.5 rounded-lg text-xs font-medium ${
                  viewMode === 'chart' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-2xs' : 'text-slate-500'
                }`}
              >
                <ChartIcon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-medium ${
                  viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-2xs' : 'text-slate-500'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {viewMode === 'chart' ? (
            <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
              <WeatherLineChart
                data={monthlyData}
                xKey="year"
                yKey="tempMean"
                yKeyMin="tempMinMean"
                yKeyMax="tempMaxMean"
                unitLabel={`°${settings.tempUnit}`}
                lineName="Monthly Mean"
                showTrendline={false}
                height={260}
                valueConverter={(value) => convertTemp(value, settings.tempUnit)}
              />
            </div>
          ) : (
            <DataTable
              data={monthlyData}
              columns={columns}
              defaultSortKey="year"
              defaultSortDir="desc"
              keyExtractor={(d) => d.year}
            />
          )}
        </div>
      )}
    </div>
  );
};
