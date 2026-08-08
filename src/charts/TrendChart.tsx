import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useApp } from '../context/AppContext';

interface TrendChartProps {
  data: any[];
  unitLabel?: string;
  height?: number;
}

export const TrendChart: React.FC<TrendChartProps> = ({ data, unitLabel = '°C', height = 300 }) => {
  const { isDark } = useApp();
  const [showRaw, setShowRaw] = useState(true);
  const [showMA5, setShowMA5] = useState(true);
  const [showMA10, setShowMA10] = useState(true);
  const [showTrend, setShowTrend] = useState(true);

  const gridColor = isDark ? '#334155' : '#e2e8f0';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const tooltipBg = isDark ? '#1e293b' : '#ffffff';
  const tooltipBorder = isDark ? '#475569' : '#cbd5e1';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="p-3 rounded-xl shadow-lg border text-xs space-y-1 z-50 font-sans"
          style={{ backgroundColor: tooltipBg, borderColor: tooltipBorder }}
        >
          <div className="font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-1 mb-1">
            Year {label}
          </div>
          {payload.map((entry: any, index: number) => {
            if (entry.value === null || entry.value === undefined) return null;
            return (
              <div key={index} className="flex items-center justify-between space-x-3">
                <span style={{ color: entry.color }} className="font-medium">
                  {entry.name}:
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value} {unitLabel}
                </span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-3">
      {/* Curve toggles */}
      <div className="flex flex-wrap gap-2 text-xs">
        <button
          onClick={() => setShowRaw(!showRaw)}
          className={`px-2.5 py-1 rounded-lg border font-medium transition-colors ${
            showRaw
              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
              : 'text-slate-400 border-slate-200 dark:border-slate-700'
          }`}
        >
          Annual Mean
        </button>
        <button
          onClick={() => setShowMA5(!showMA5)}
          className={`px-2.5 py-1 rounded-lg border font-medium transition-colors ${
            showMA5
              ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800'
              : 'text-slate-400 border-slate-200 dark:border-slate-700'
          }`}
        >
          5-Year MA
        </button>
        <button
          onClick={() => setShowMA10(!showMA10)}
          className={`px-2.5 py-1 rounded-lg border font-medium transition-colors ${
            showMA10
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
              : 'text-slate-400 border-slate-200 dark:border-slate-700'
          }`}
        >
          10-Year MA
        </button>
        <button
          onClick={() => setShowTrend(!showTrend)}
          className={`px-2.5 py-1 rounded-lg border font-medium transition-colors ${
            showTrend
              ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800'
              : 'text-slate-400 border-slate-200 dark:border-slate-700'
          }`}
        >
          Trend Line
        </button>
      </div>

      <div className="w-full" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis dataKey="year" stroke={textColor} fontSize={11} tickLine={false} axisLine={{ stroke: gridColor }} />
            <YAxis stroke={textColor} fontSize={11} tickLine={false} axisLine={{ stroke: gridColor }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />

            {showRaw && (
              <Line
                type="monotone"
                dataKey="value"
                name="Annual Mean"
                stroke="#f59e0b"
                strokeWidth={1.5}
                dot={{ r: 2, fill: '#f59e0b' }}
              />
            )}

            {showMA5 && (
              <Line
                type="monotone"
                dataKey="ma5"
                name="5-Yr MA"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={false}
              />
            )}

            {showMA10 && (
              <Line
                type="monotone"
                dataKey="ma10"
                name="10-Yr MA"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={false}
              />
            )}

            {showTrend && (
              <Line
                type="linear"
                dataKey="trendLine"
                name="Linear Trend"
                stroke="#a855f7"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
