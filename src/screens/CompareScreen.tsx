import React, { useState, useEffect, useMemo } from 'react';
import { GitCompare, MapPin, RefreshCw, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Location } from '../models/location';
import { DEFAULT_LOCATION, searchLocations } from '../services/geocodingApi';
import { getHistoricalWeather } from '../services/weatherApi';
import { HistoricalDataResult } from '../models/weather';
import { processAnnualAnalysis, processMonthlyAnalysis, processSameDayThroughYears } from '../services/weatherStatistics';
import { MONTH_NAMES, getCurrentYear, pad2 } from '../utils/dates';
import { formatTemp } from '../utils/units';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface CompareScreenProps {
  onOpenSearch: () => void;
}

const DUBLIN_LOCATION: Location = {
  id: 2964574,
  name: 'Dublin',
  latitude: 53.3498,
  longitude: -6.2603,
  country: 'Ireland',
  timezone: 'Europe/Dublin',
};

export const CompareScreen: React.FC<CompareScreenProps> = ({ onOpenSearch }) => {
  const { location: loc1, settings } = useApp();
  const [loc2, setLoc2] = useState<Location>(DUBLIN_LOCATION);
  const [searchQueryLoc2, setSearchQueryLoc2] = useState<string>('');
  const [searchResultsLoc2, setSearchResultsLoc2] = useState<Location[]>([]);
  const [isSearching2, setIsSearching2] = useState<boolean>(false);

  const currentYear = getCurrentYear();
  const [compareMode, setCompareMode] = useState<'sameday' | 'monthly' | 'annual'>('sameday');
  const [month, setMonth] = useState<number>(8); // August
  const [day, setDay] = useState<number>(1);
  const [startYear, setStartYear] = useState<number>(1985);
  const [endYear, setEndYear] = useState<number>(currentYear);

  const [history1, setHistory1] = useState<HistoricalDataResult | null>(null);
  const [history2, setHistory2] = useState<HistoricalDataResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search location 2 handling
  useEffect(() => {
    if (!searchQueryLoc2.trim() || searchQueryLoc2.trim().length < 2) {
      setSearchResultsLoc2([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await searchLocations(searchQueryLoc2);
        setSearchResultsLoc2(res);
      } catch (e) {}
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQueryLoc2]);

  const fetchComparisonData = async (forceRefresh: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      let startStr = `${startYear}-01-01`;
      let endStr = `${endYear}-12-31`;

      if (compareMode === 'sameday' || compareMode === 'monthly') {
        startStr = `${startYear}-${pad2(month)}-01`;
        endStr = `${endYear}-${pad2(month)}-${month === 2 ? '28' : [4, 6, 9, 11].includes(month) ? '30' : '31'}`;
      }

      const [res1, res2] = await Promise.all([
        getHistoricalWeather(loc1, startStr, endStr, forceRefresh),
        getHistoricalWeather(loc2, startStr, endStr, forceRefresh),
      ]);

      setHistory1(res1);
      setHistory2(res2);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch comparison datasets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparisonData(false);
  }, [loc1, loc2, compareMode, month, day, startYear, endYear]);

  // Comparative data processing
  const chartData = useMemo(() => {
    if (!history1 || !history2) return [];

    if (compareMode === 'sameday') {
      const p1 = processSameDayThroughYears(history1.records, month, day, 'tempMean');
      const p2 = processSameDayThroughYears(history2.records, month, day, 'tempMean');

      const map2 = new Map<number, number | null>();
      p2.data.forEach((d) => map2.set(d.year, d.tempMean));

      return p1.data.map((d) => {
        const val2 = map2.get(d.year) ?? null;
        const diff = d.tempMean !== null && val2 !== null ? d.tempMean - val2 : null;
        return {
          label: d.year,
          loc1Val: d.tempMean,
          loc2Val: val2,
          difference: diff,
        };
      });
    }

    if (compareMode === 'monthly') {
      const p1 = processMonthlyAnalysis(history1.records, month);
      const p2 = processMonthlyAnalysis(history2.records, month);

      const map2 = new Map<number, number | null>();
      p2.forEach((d) => map2.set(d.year, d.tempMean));

      return p1.map((d) => {
        const val2 = map2.get(d.year) ?? null;
        const diff = d.tempMean !== null && val2 !== null ? d.tempMean - val2 : null;
        return {
          label: d.year,
          loc1Val: d.tempMean,
          loc2Val: val2,
          difference: diff,
        };
      });
    }

    const p1 = processAnnualAnalysis(history1.records);
    const p2 = processAnnualAnalysis(history2.records);

    const map2 = new Map<number, number | null>();
    p2.forEach((d) => map2.set(d.year, d.tempMean));

    return p1.map((d) => {
      const val2 = map2.get(d.year) ?? null;
      const diff = d.tempMean !== null && val2 !== null ? d.tempMean - val2 : null;
      return {
        label: d.year,
        loc1Val: d.tempMean,
        loc2Val: val2,
        difference: diff,
      };
    });
  }, [history1, history2, compareMode, month, day]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <GitCompare className="w-5 h-5 text-purple-500" />
            <span>Compare Locations</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Compare climate trends between two locations
          </p>
        </div>
        <button
          onClick={() => fetchComparisonData(true)}
          className="p-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Cities Selector Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* City 1 */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between shadow-2xs">
          <div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Location 1</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-blue-500" />
              <span>{loc1.name}</span>
            </div>
            <div className="text-[10px] text-slate-400">
              {[loc1.admin1, loc1.country].filter(Boolean).join(', ')}
            </div>
          </div>
          <button
            onClick={onOpenSearch}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 rounded-lg hover:bg-blue-100 transition-colors"
          >
            Change
          </button>
        </div>

        {/* City 2 */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-700/80 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Location 2</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-purple-500" />
                <span>{loc2.name}</span>
              </div>
              <div className="text-[10px] text-slate-400">
                {[loc2.admin1, loc2.country].filter(Boolean).join(', ')}
              </div>
            </div>
            <button
              onClick={() => setIsSearching2(!isSearching2)}
              className="text-xs text-purple-600 dark:text-purple-400 font-semibold px-2.5 py-1 bg-purple-50 dark:bg-purple-950/40 rounded-lg hover:bg-purple-100 transition-colors"
            >
              {isSearching2 ? 'Close' : 'Change'}
            </button>
          </div>

          {isSearching2 && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700 space-y-1.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQueryLoc2}
                  onChange={(e) => setSearchQueryLoc2(e.target.value)}
                  placeholder="Search location 2 (e.g. Dublin)"
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>
              {searchResultsLoc2.length > 0 && (
                <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  {searchResultsLoc2.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setLoc2(item);
                        setIsSearching2(false);
                        setSearchQueryLoc2('');
                      }}
                      className="w-full text-left p-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs flex justify-between"
                    >
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</span>
                      <span className="text-slate-400">{item.country}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Comparison Controls */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 shadow-xs">
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <GitCompare className="w-4 h-4 text-purple-500" />
          <span>Comparison Mode</span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl text-xs font-medium">
          <button
            onClick={() => setCompareMode('sameday')}
            className={`py-1.5 rounded-lg transition-all ${
              compareMode === 'sameday'
                ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-2xs font-bold'
                : 'text-slate-500'
            }`}
          >
            Same Day
          </button>
          <button
            onClick={() => setCompareMode('monthly')}
            className={`py-1.5 rounded-lg transition-all ${
              compareMode === 'monthly'
                ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-2xs font-bold'
                : 'text-slate-500'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setCompareMode('annual')}
            className={`py-1.5 rounded-lg transition-all ${
              compareMode === 'annual'
                ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-2xs font-bold'
                : 'text-slate-500'
            }`}
          >
            Annual
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {compareMode !== 'annual' && (
            <div>
              <label className="block text-[10px] text-slate-400 font-medium mb-1">Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value, 10))}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1 text-slate-900 dark:text-white"
              >
                {MONTH_NAMES.map((m, idx) => (
                  <option key={m} value={idx + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          )}

          {compareMode === 'sameday' && (
            <div>
              <label className="block text-[10px] text-slate-400 font-medium mb-1">Day</label>
              <select
                value={day}
                onChange={(e) => setDay(parseInt(e.target.value, 10))}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1 text-slate-900 dark:text-white"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-[10px] text-slate-400 font-medium mb-1">Start Year</label>
            <select
              value={startYear}
              onChange={(e) => setStartYear(parseInt(e.target.value, 10))}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1 text-slate-900 dark:text-white"
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
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1 text-slate-900 dark:text-white"
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
        <LoadingState message={`Comparing Open-Meteo datasets for ${loc1.name} and ${loc2.name}...`} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchComparisonData(true)} />
      ) : (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
              Temperature Comparison: {loc1.name} vs {loc2.name} ({startYear} → {endYear})
            </div>

            <div className="w-full h-[300px] sm:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip wrapperStyle={{ fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  <Line
                    type="monotone"
                    dataKey="loc1Val"
                    name={loc1.name}
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="loc2Val"
                    name={loc2.name}
                    stroke="#a855f7"
                    strokeWidth={2.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
