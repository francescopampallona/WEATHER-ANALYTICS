import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Calendar, RefreshCw, Thermometer, CloudRain, Clock, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getHistoricalWeather } from '../services/weatherApi';
import { processWeatherRecords } from '../services/weatherStatistics';
import { HistoricalDataResult } from '../models/weather';
import { getCurrentYear, getMaxHistoricalDate } from '../utils/dates';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';

export const RecordsScreen: React.FC = () => {
  const { location, settings } = useApp();
  const currentYear = getCurrentYear();

  const [startYear, setStartYear] = useState<number>(1980);
  const [endYear, setEndYear] = useState<number>(currentYear);

  const [rawHistory, setRawHistory] = useState<HistoricalDataResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (forceRefresh: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const startStr = `${startYear}-01-01`;
      const endStr = endYear === currentYear ? getMaxHistoricalDate() : `${endYear}-12-31`;

      const data = await getHistoricalWeather(location, startStr, endStr, forceRefresh);
      setRawHistory(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch weather records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(false);
  }, [location, startYear, endYear]);

  const recordItems = useMemo(() => {
    if (!rawHistory) return [];
    return processWeatherRecords(rawHistory.records, startYear, endYear);
  }, [rawHistory, startYear, endYear]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'temperature':
        return <Thermometer className="w-5 h-5 text-rose-500" />;
      case 'precipitation':
        return <CloudRain className="w-5 h-5 text-blue-500" />;
      case 'duration':
        return <Clock className="w-5 h-5 text-amber-500" />;
      default:
        return <Trophy className="w-5 h-5 text-emerald-500" />;
    }
  };

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-emerald-500" />
            <span>Weather Records & All-Time Extremes</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Historical climate records and extreme events for {location.name}
          </p>
        </div>
        <button
          onClick={() => fetchData(true)}
          title="Refresh Open-Meteo Data"
          className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Period Selector Card */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-700/80 space-y-2 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Calendar className="w-4 h-4 text-emerald-500" />
            <span>Analyzed Period Range</span>
          </div>
          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 px-2.5 py-0.5 rounded-full">
            {startYear} – {endYear}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="block text-[10px] text-slate-400 font-medium mb-1">Start Year</label>
            <select
              value={startYear}
              onChange={(e) => setStartYear(parseInt(e.target.value, 10))}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-900 dark:text-white font-medium"
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
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-900 dark:text-white font-medium"
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
        <LoadingState message={`Scanning Open-Meteo records for ${location.name} (${startYear}–${endYear})...`} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchData(true)} />
      ) : (
        <div className="space-y-3">
          <div className="bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-3 text-xs text-amber-800 dark:text-amber-300 flex items-start space-x-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <span>
              All climate records below are calculated exclusively from verified Open-Meteo API data for{' '}
              <strong>
                {location.name} ({startYear}–{endYear})
              </strong>
              .
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recordItems.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs flex items-center space-x-3.5"
              >
                <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-2xl shrink-0">
                  {getCategoryIcon(item.category)}
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {item.title}
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{item.value}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.subtext}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
