import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Sliders, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getHistoricalWeather } from '../services/weatherApi';
import { processAnomalies } from '../services/weatherStatistics';
import { HistoricalDataResult } from '../models/weather';
import { ActiveMetric } from '../models/statistics';
import { getCurrentYear } from '../utils/dates';
import { formatTemp } from '../utils/units';
import { MetricCard } from '../components/MetricCard';
import { MetricSelector } from '../components/MetricSelector';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { WeatherBarChart } from '../charts/WeatherBarChart';

interface AnomaliesScreenProps {
  onBack: () => void;
}

export const AnomaliesScreen: React.FC<AnomaliesScreenProps> = ({ onBack }) => {
  const { location, settings } = useApp();
  const currentYear = getCurrentYear();

  const [startYear, setStartYear] = useState<number>(1960);
  const [endYear, setEndYear] = useState<number>(currentYear);
  const [baselineStart, setBaselineStart] = useState<number>(settings.defaultBaselineStart || 1991);
  const [baselineEnd, setBaselineEnd] = useState<number>(settings.defaultBaselineEnd || 2020);
  const [activeMetric, setActiveMetric] = useState<ActiveMetric>('tempMean');

  const [rawHistory, setRawHistory] = useState<HistoricalDataResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (forceRefresh: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const startStr = `${startYear}-01-01`;
      const endStr = `${endYear}-12-31`;

      const data = await getHistoricalWeather(location, startStr, endStr, forceRefresh);
      setRawHistory(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch climate anomaly data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(false);
  }, [location, startYear, endYear]);

  const anomalyResult = useMemo(() => {
    if (!rawHistory) return null;
    return processAnomalies(rawHistory.records, baselineStart, baselineEnd, activeMetric);
  }, [rawHistory, baselineStart, baselineEnd, activeMetric]);

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
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Weather Anomalies</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Temperature & climate deviations from baseline for {location.name}</p>
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

      {/* Baseline controls */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-700/80 space-y-2 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Sliders className="w-4 h-4 text-purple-500" />
            <span>Select Climatological Baseline</span>
          </div>
          <span className="text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300 px-2 py-0.5 rounded-full">
            {baselineStart}–{baselineEnd} Baseline
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="block text-[10px] text-slate-400 font-medium mb-1">Baseline Start</label>
            <input
              type="number"
              value={baselineStart}
              onChange={(e) => setBaselineStart(parseInt(e.target.value, 10))}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-400 font-medium mb-1">Baseline End</label>
            <input
              type="number"
              value={baselineEnd}
              onChange={(e) => setBaselineEnd(parseInt(e.target.value, 10))}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingState message={`Calculating anomalies relative to ${baselineStart}–${baselineEnd} baseline...`} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchData(true)} />
      ) : anomalyResult ? (
        <div className="space-y-4">
          <MetricSelector activeMetric={activeMetric} onChange={setActiveMetric} showWind={false} />

          {anomalyResult.baselineMean !== null && (
            <MetricCard
              title="Calculated Baseline Average"
              value={formatTemp(anomalyResult.baselineMean, settings.tempUnit)}
              subtext={`Derived from Open-Meteo ${baselineStart}–${baselineEnd} records`}
              badge="Baseline Mean"
              badgeColor="emerald"
            />
          )}

          <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            <WeatherBarChart
              data={anomalyResult.anomalies}
              xKey="year"
              yKey="anomaly"
              unitLabel={`°${settings.tempUnit}`}
              barName="Anomaly"
              isAnomaly={true}
              height={270}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};
