import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Calendar, RefreshCw, Table, LineChart as ChartIcon, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getHistoricalWeather } from '../services/weatherApi';
import { processSameDayThroughYears } from '../services/weatherStatistics';
import { HistoricalDataResult } from '../models/weather';
import { ActiveMetric, SameDayYearData } from '../models/statistics';
import { MONTH_NAMES, getCurrentYear, pad2 } from '../utils/dates';
import { formatTemp, formatWind, formatPrecip, getMetricUnitLabel } from '../utils/units';
import { MetricCard } from '../components/MetricCard';
import { MetricSelector } from '../components/MetricSelector';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { WeatherLineChart } from '../charts/WeatherLineChart';
import { DataTable, ColumnDef } from '../components/DataTable';

interface SameDayScreenProps {
  onBack: () => void;
}

export const SameDayScreen: React.FC<SameDayScreenProps> = ({ onBack }) => {
  const { location, settings } = useApp();
  const currentYear = getCurrentYear();

  // Inputs state
  const [day, setDay] = useState<number>(1);
  const [month, setMonth] = useState<number>(8); // August
  const [startYear, setStartYear] = useState<number>(settings.defaultStartYear || 1985);
  const [endYear, setEndYear] = useState<number>(currentYear);
  const [activeMetric, setActiveMetric] = useState<ActiveMetric>('tempMean');
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  // API State
  const [rawHistory, setRawHistory] = useState<HistoricalDataResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (forceRefresh: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const startStr = `${startYear}-${pad2(month)}-01`;
      // Ensure end date doesn't exceed current year limit
      const endMonth = pad2(month);
      const endStr = `${endYear}-${endMonth}-${pad2(day > 28 ? 28 : day)}`;

      const data = await getHistoricalWeather(location, startStr, endStr, forceRefresh);
      setRawHistory(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch historical weather data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(false);
  }, [location, startYear, endYear, month]);

  // Process data for selected day across years
  const processed = useMemo(() => {
    if (!rawHistory) return null;
    return processSameDayThroughYears(rawHistory.records, month, day, activeMetric);
  }, [rawHistory, month, day, activeMetric]);

  const unitLabel = getMetricUnitLabel(
    activeMetric,
    settings.tempUnit,
    settings.windUnit,
    settings.precipUnit
  );

  const columns: ColumnDef<SameDayYearData>[] = [
    { key: 'year', header: 'Year', accessor: (d) => d.year },
    { key: 'date', header: 'Date', accessor: (d) => d.date },
    {
      key: 'tempMean',
      header: 'Mean',
      accessor: (d) => d.tempMean,
      format: (val) => formatTemp(val, settings.tempUnit),
      align: 'right',
    },
    {
      key: 'tempMin',
      header: 'Min',
      accessor: (d) => d.tempMin,
      format: (val) => formatTemp(val, settings.tempUnit),
      align: 'right',
    },
    {
      key: 'tempMax',
      header: 'Max',
      accessor: (d) => d.tempMax,
      format: (val) => formatTemp(val, settings.tempUnit),
      align: 'right',
    },
    {
      key: 'precipitation',
      header: 'Rain',
      accessor: (d) => d.precipitation,
      format: (val) => formatPrecip(val, settings.precipUnit),
      align: 'right',
    },
    {
      key: 'windSpeedMax',
      header: 'Wind',
      accessor: (d) => d.windSpeedMax,
      format: (val) => formatWind(val, settings.windUnit),
      align: 'right',
    },
  ];

  const yearOptions = [];
  for (let y = 1940; y <= currentYear; y++) {
    yearOptions.push(y);
  }

  return (
    <div className="flex-1 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Same Day Through Years</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Comparing {location.name} on a specific calendar date across decades</p>
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

      {/* Date Selectors Card */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-700/80 space-y-3 shadow-xs">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
          <div className="flex items-center space-x-1.5">
            <Calendar className="w-4 h-4 text-amber-500" />
            <span>Select Target Date & Range</span>
          </div>
          {month === 2 && day === 29 && (
            <span className="text-[10px] bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300 px-2 py-0.5 rounded-full">
              Leap Years Only
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div>
            <label className="block text-[10px] text-slate-400 font-medium mb-1">Day</label>
            <select
              value={day}
              onChange={(e) => setDay(parseInt(e.target.value, 10))}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-900 dark:text-white font-medium"
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 font-medium mb-1">Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value, 10))}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-900 dark:text-white font-medium"
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
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-900 dark:text-white font-medium"
            >
              {yearOptions.map((y) => (
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
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-900 dark:text-white font-medium"
            >
              {yearOptions
                .filter((y) => y >= startYear)
                .map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content View */}
      {loading ? (
        <LoadingState message={`Retrieving ${day} ${MONTH_NAMES[month - 1]} weather from 1985 to ${endYear}...`} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchData(true)} />
      ) : processed ? (
        <div className="space-y-4">
          {/* Controls bar: Metric & View Mode */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <MetricSelector activeMetric={activeMetric} onChange={setActiveMetric} />

            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('chart')}
                className={`p-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 ${
                  viewMode === 'chart'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                    : 'text-slate-500'
                }`}
              >
                <ChartIcon className="w-3.5 h-3.5" />
                <span>Chart</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                    : 'text-slate-500'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>
            </div>
          </div>

          {/* Chart or Table */}
          {viewMode === 'chart' ? (
            <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {day} {MONTH_NAMES[month - 1]} ({processed.data.length} Years)
                </span>
                {processed.summary.trendPerDecade !== undefined && (
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 font-mono">
                    Trend: {processed.summary.trendPerDecade > 0 ? '+' : ''}
                    {processed.summary.trendPerDecade.toFixed(2)} {unitLabel} / decade
                  </span>
                )}
              </div>
              <WeatherLineChart
                data={processed.data}
                xKey="year"
                yKey={activeMetric}
                trendKey="trendVal"
                unitLabel={unitLabel}
                lineName={`${day} ${MONTH_NAMES[month - 1]}`}
                height={260}
              />
            </div>
          ) : (
            <DataTable
              data={processed.data}
              columns={columns}
              defaultSortKey="year"
              defaultSortDir="desc"
              keyExtractor={(d) => d.year}
            />
          )}

          {/* Statistics Summary Panel */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 flex items-center space-x-1">
              <Info className="w-3.5 h-3.5" />
              <span>Calculated Period Statistics</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <MetricCard
                title="Period Average"
                value={formatTemp(processed.summary.mean, settings.tempUnit)}
                badge="Mean"
                badgeColor="blue"
              />
              <MetricCard
                title="Period Median"
                value={formatTemp(processed.summary.median, settings.tempUnit)}
                badge="Median"
                badgeColor="slate"
              />
              <MetricCard
                title="Warmest Year"
                value={
                  processed.summary.warmestYear
                    ? formatTemp(processed.summary.warmestYear.value, settings.tempUnit)
                    : 'N/A'
                }
                subtext={
                  processed.summary.warmestYear ? `Year ${processed.summary.warmestYear.year}` : undefined
                }
                badgeColor="rose"
              />
              <MetricCard
                title="Coldest Year"
                value={
                  processed.summary.coldestYear
                    ? formatTemp(processed.summary.coldestYear.value, settings.tempUnit)
                    : 'N/A'
                }
                subtext={
                  processed.summary.coldestYear ? `Year ${processed.summary.coldestYear.year}` : undefined
                }
                badgeColor="blue"
              />
              <MetricCard
                title="Std Deviation"
                value={
                  processed.summary.stdDev !== null
                    ? `±${processed.summary.stdDev.toFixed(2)}`
                    : 'N/A'
                }
                subtext="Variance spread"
                badgeColor="emerald"
              />
              <MetricCard
                title="Linear Trend"
                value={
                  processed.summary.trendPerDecade !== undefined && processed.summary.trendPerDecade !== null
                    ? `${processed.summary.trendPerDecade > 0 ? '+' : ''}${processed.summary.trendPerDecade.toFixed(2)}`
                    : 'N/A'
                }
                subtext={`${unitLabel} per decade`}
                badgeColor="amber"
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
