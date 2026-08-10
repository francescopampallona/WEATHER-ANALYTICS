import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Flame, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getHistoricalWeather } from '../services/weatherApi';
import { processAnnualAnalysis } from '../services/weatherStatistics';
import { HistoricalDataResult } from '../models/weather';
import { clampToMaxHistoricalDate, getCurrentYear } from '../utils/dates';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { formatTemp } from '../utils/units';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface ExtremesScreenProps {
  onBack: () => void;
}

export const ExtremesScreen: React.FC<ExtremesScreenProps> = ({ onBack }) => {
  const { location, settings } = useApp();
  const currentYear = getCurrentYear();

  const [startYear, setStartYear] = useState<number>(1985);
  const [endYear, setEndYear] = useState<number>(currentYear);
  const [thresholdType, setThresholdType] = useState<'heat35' | 'heat30' | 'frost' | 'heavyRain'>('heat35');

  const [rawHistory, setRawHistory] = useState<HistoricalDataResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (forceRefresh: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const startStr = `${startYear}-01-01`;
      const endStr = clampToMaxHistoricalDate(`${endYear}-12-31`);

      const data = await getHistoricalWeather(location, startStr, endStr, forceRefresh);
      setRawHistory(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch extreme weather events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(false);
  }, [location, startYear, endYear]);

  const annuals = useMemo(() => {
    if (!rawHistory) return [];
    return processAnnualAnalysis(rawHistory.records);
  }, [rawHistory]);

  const chartData = useMemo(() => {
    return annuals.map((a) => {
      let count = a.daysAbove35;
      if (thresholdType === 'heat30') count = a.daysAbove30;
      if (thresholdType === 'frost') count = a.daysBelow0;
      if (thresholdType === 'heavyRain') count = a.precipDaysCount;

      return {
        year: a.year,
        count,
      };
    });
  }, [annuals, thresholdType]);

  const getLabel = () => {
    switch (thresholdType) {
      case 'heat35':
        return `Days with Max Temp > ${formatTemp(35, settings.tempUnit, 0)}`;
      case 'heat30':
        return `Days with Max Temp > ${formatTemp(30, settings.tempUnit, 0)}`;
      case 'frost':
        return `Frost Days (Min Temp < ${formatTemp(0, settings.tempUnit, 0)})`;
      case 'heavyRain':
        return 'Days with Rain ≥ 0.1 mm';
    }
  };

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
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Extreme Events</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Frequency analysis for extreme heat, frost, and precipitation in {location.name}</p>
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

      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 shadow-xs">
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Flame className="w-4 h-4 text-orange-500" />
          <span>Configure Threshold</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl text-xs font-medium">
          <button
            onClick={() => setThresholdType('heat35')}
            className={`py-1.5 rounded-lg ${
              thresholdType === 'heat35' ? 'bg-white dark:bg-slate-800 text-rose-600 font-bold shadow-2xs' : 'text-slate-500'
            }`}
          >
            &gt; {formatTemp(35, settings.tempUnit, 0)} Heat
          </button>
          <button
            onClick={() => setThresholdType('heat30')}
            className={`py-1.5 rounded-lg ${
              thresholdType === 'heat30' ? 'bg-white dark:bg-slate-800 text-amber-600 font-bold shadow-2xs' : 'text-slate-500'
            }`}
          >
            &gt; {formatTemp(30, settings.tempUnit, 0)} Warm
          </button>
          <button
            onClick={() => setThresholdType('frost')}
            className={`py-1.5 rounded-lg ${
              thresholdType === 'frost' ? 'bg-white dark:bg-slate-800 text-blue-600 font-bold shadow-2xs' : 'text-slate-500'
            }`}
          >
            &lt; {formatTemp(0, settings.tempUnit, 0)} Frost
          </button>
          <button
            onClick={() => setThresholdType('heavyRain')}
            className={`py-1.5 rounded-lg ${
              thresholdType === 'heavyRain' ? 'bg-white dark:bg-slate-800 text-cyan-600 font-bold shadow-2xs' : 'text-slate-500'
            }`}
          >
            Rainy Days
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Counting extreme weather threshold occurrences..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchData(true)} />
      ) : (
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-3">
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{getLabel()} Per Year</div>

          <div className="w-full h-[280px] sm:h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="count" name="Days Count" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
