import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Clock, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getHistoricalWeather } from '../services/weatherApi';
import { processDecadeComparison } from '../services/weatherStatistics';
import { HistoricalDataResult } from '../models/weather';
import { getCurrentYear } from '../utils/dates';
import { formatTemp, formatPrecip } from '../utils/units';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface DecadeComparisonScreenProps {
  onBack: () => void;
}

export const DecadeComparisonScreen: React.FC<DecadeComparisonScreenProps> = ({ onBack }) => {
  const { location, settings } = useApp();
  const currentYear = getCurrentYear();

  const [rawHistory, setRawHistory] = useState<HistoricalDataResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (forceRefresh: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHistoricalWeather(location, '1980-01-01', `${currentYear}-12-31`, forceRefresh);
      setRawHistory(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch decade data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(false);
  }, [location]);

  const decades = useMemo(() => {
    if (!rawHistory) return [];
    return processDecadeComparison(rawHistory.records);
  }, [rawHistory]);

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
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Decade Comparison</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Comparing climate summaries across decades (1980s → 2020s) for {location.name}</p>
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

      {loading ? (
        <LoadingState message="Aggregating weather records by decade..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchData(true)} />
      ) : (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
              Mean Temperature by Decade (°{settings.tempUnit})
            </div>
            <div className="w-full h-[280px] sm:h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={decades} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="decadeLabel" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip wrapperStyle={{ fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
                  <Bar dataKey="tempMean" name="Decade Mean Temp" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="tempMaxMean" name="Avg Max Temp" fill="#ef4444" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Decade Breakdown Cards
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {decades.map((dec) => (
                <div
                  key={dec.decadeLabel}
                  className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs space-y-2"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-2">
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center space-x-1.5">
                      <Clock className="w-4 h-4 text-teal-500" />
                      <span>
                        {dec.decadeLabel} ({dec.startYear}–{dec.endYear})
                      </span>
                    </span>
                    <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                      Mean: {formatTemp(dec.tempMean, settings.tempUnit)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs font-sans text-slate-600 dark:text-slate-300">
                    <div>
                      <div className="text-[10px] text-slate-400">Avg High</div>
                      <div className="font-bold">{formatTemp(dec.tempMaxMean, settings.tempUnit)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Avg Low</div>
                      <div className="font-bold">{formatTemp(dec.tempMinMean, settings.tempUnit)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Avg Annual Rain</div>
                      <div className="font-bold">{formatPrecip(dec.precipTotal, settings.precipUnit)}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-xs pt-1 border-t border-slate-100 dark:border-slate-700/40 text-amber-600 dark:text-amber-400">
                    <span>Avg &gt;30°C days/yr: <strong>{dec.daysAbove30}</strong></span>
                    <span>Avg &gt;35°C days/yr: <strong>{dec.daysAbove35}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
