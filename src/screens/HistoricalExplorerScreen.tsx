import React, { useState, useEffect } from 'react';
import { ArrowLeft, Layers, RefreshCw, Table, LineChart as ChartIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getHistoricalWeather } from '../services/weatherApi';
import { HistoricalDataResult, DailyWeatherRecord } from '../models/weather';
import { ActiveMetric } from '../models/statistics';
import { mean, median, min, max, standardDeviation } from '../utils/statistics';
import { formatTemp, formatWind, formatPrecip, getMetricUnitLabel } from '../utils/units';
import { MetricCard } from '../components/MetricCard';
import { MetricSelector } from '../components/MetricSelector';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { WeatherLineChart } from '../charts/WeatherLineChart';
import { DataTable, ColumnDef } from '../components/DataTable';

interface HistoricalExplorerScreenProps {
  onBack: () => void;
}

export const HistoricalExplorerScreen: React.FC<HistoricalExplorerScreenProps> = ({ onBack }) => {
  const { location, settings } = useApp();

  const [startDate, setStartDate] = useState<string>('2024-01-01');
  const [endDate, setEndDate] = useState<string>('2024-12-31');
  const [activeMetric, setActiveMetric] = useState<ActiveMetric>('tempMean');
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  const [rawHistory, setRawHistory] = useState<HistoricalDataResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (forceRefresh: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHistoricalWeather(location, startDate, endDate, forceRefresh);
      setRawHistory(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch historical explorer data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(false);
  }, [location, startDate, endDate]);

  const unitLabel = getMetricUnitLabel(
    activeMetric,
    settings.tempUnit,
    settings.windUnit,
    settings.precipUnit
  );

  const records = rawHistory?.records || [];

  const stats = React.useMemo(() => {
    if (records.length === 0) return null;
    const vals = records
      .map((r) => {
        if (activeMetric === 'tempMean') return r.tempMean;
        if (activeMetric === 'tempMin') return r.tempMin;
        if (activeMetric === 'tempMax') return r.tempMax;
        if (activeMetric === 'precipitation') return r.precipitation;
        if (activeMetric === 'windSpeedMax') return r.windSpeedMax;
        return r.tempMean;
      })
      .filter((v): v is number => v !== null);

    return {
      count: vals.length,
      mean: mean(vals),
      median: median(vals),
      min: min(vals),
      max: max(vals),
      stdDev: standardDeviation(vals),
    };
  }, [records, activeMetric]);

  const columns: ColumnDef<any>[] = [
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
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Historical Explorer</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Deep-dive into time series data for {location.name}</p>
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

      {/* Date Pickers */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-700/80 space-y-2 shadow-xs">
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Layers className="w-4 h-4 text-blue-500" />
          <span>Select Date Range</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="block text-[10px] text-slate-400 font-medium mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-400 font-medium mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <LoadingState message="Fetching time series from Open-Meteo Archive API..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchData(true)} />
      ) : (
        <div className="space-y-4">
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

          {viewMode === 'chart' ? (
            <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
              <WeatherLineChart
                data={records}
                xKey="date"
                yKey={activeMetric}
                yKeyMin="tempMin"
                yKeyMax="tempMax"
                unitLabel={unitLabel}
                lineName="Mean Temp"
                showTrendline={false}
                height={260}
              />
            </div>
          ) : (
            <DataTable
              data={records}
              columns={columns}
              defaultSortKey="date"
              defaultSortDir="desc"
              keyExtractor={(d) => d.date}
            />
          )}

          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <MetricCard
                title="Average"
                value={formatTemp(stats.mean, settings.tempUnit)}
                badge="Mean"
                badgeColor="blue"
              />
              <MetricCard
                title="Median"
                value={formatTemp(stats.median, settings.tempUnit)}
                badge="Median"
                badgeColor="slate"
              />
              <MetricCard
                title="Minimum"
                value={formatTemp(stats.min, settings.tempUnit)}
                badgeColor="blue"
              />
              <MetricCard
                title="Maximum"
                value={formatTemp(stats.max, settings.tempUnit)}
                badgeColor="rose"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
