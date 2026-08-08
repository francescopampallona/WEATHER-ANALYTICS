import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { useApp } from '../context/AppContext';

interface WeatherLineChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  yKeyMin?: string;
  yKeyMax?: string;
  trendKey?: string;
  unitLabel?: string;
  lineName?: string;
  showTrendline?: boolean;
  height?: number | string;
}

export const WeatherLineChart: React.FC<WeatherLineChartProps> = ({
  data,
  xKey,
  yKey,
  yKeyMin,
  yKeyMax,
  trendKey,
  unitLabel = '°C',
  lineName = 'Temperature',
  showTrendline = true,
  height,
}) => {
  const { isDark } = useApp();

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
            {label}
          </div>
          {payload.map((entry: any, index: number) => {
            if (entry.value === null || entry.value === undefined) return null;
            return (
              <div key={index} className="flex items-center justify-between space-x-3">
                <span style={{ color: entry.color }} className="font-medium">
                  {entry.name}:
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value} {unitLabel}
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
    <div
      className={typeof height === 'string' ? height : 'w-full h-[280px] sm:h-[380px]'}
      style={typeof height === 'number' ? { height } : undefined}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis
            dataKey={xKey}
            stroke={textColor}
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: gridColor }}
          />
          <YAxis
            stroke={textColor}
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: gridColor }}
            tickFormatter={(val) => `${val}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />

          {yKeyMin && (
            <Line
              type="monotone"
              dataKey={yKeyMin}
              name="Min Temp"
              stroke="#3b82f6"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 4 }}
            />
          )}

          <Line
            type="monotone"
            dataKey={yKey}
            name={lineName}
            stroke="#f59e0b"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#f59e0b', strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />

          {yKeyMax && (
            <Line
              type="monotone"
              dataKey={yKeyMax}
              name="Max Temp"
              stroke="#ef4444"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 4 }}
            />
          )}

          {showTrendline && trendKey && (
            <Line
              type="linear"
              dataKey={trendKey}
              name="Linear Trend"
              stroke="#8b5cf6"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
