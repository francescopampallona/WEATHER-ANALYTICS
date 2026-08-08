import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  Legend,
  ReferenceLine,
} from 'recharts';
import { useApp } from '../context/AppContext';

interface WeatherBarChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  unitLabel?: string;
  barName?: string;
  isAnomaly?: boolean;
  height?: number;
}

export const WeatherBarChart: React.FC<WeatherBarChartProps> = ({
  data,
  xKey,
  yKey,
  unitLabel = '°C',
  barName = 'Value',
  isAnomaly = false,
  height = 280,
}) => {
  const { isDark } = useApp();

  const gridColor = isDark ? '#334155' : '#e2e8f0';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const tooltipBg = isDark ? '#1e293b' : '#ffffff';
  const tooltipBorder = isDark ? '#475569' : '#cbd5e1';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      return (
        <div
          className="p-3 rounded-xl shadow-lg border text-xs space-y-1 z-50 font-sans"
          style={{ backgroundColor: tooltipBg, borderColor: tooltipBorder }}
        >
          <div className="font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-1 mb-1">
            {label}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 dark:text-slate-400">{barName}:</span>
            <span
              className={`font-mono font-bold ${
                isAnomaly
                  ? val > 0
                    ? 'text-rose-500'
                    : 'text-blue-500'
                  : 'text-slate-800 dark:text-slate-200'
              }`}
            >
              {val > 0 && isAnomaly ? '+' : ''}
              {typeof val === 'number' ? val.toFixed(2) : val} {unitLabel}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis dataKey={xKey} stroke={textColor} fontSize={11} tickLine={false} axisLine={{ stroke: gridColor }} />
          <YAxis stroke={textColor} fontSize={11} tickLine={false} axisLine={{ stroke: gridColor }} />
          <Tooltip content={<CustomTooltip />} />
          {isAnomaly && <ReferenceLine y={0} stroke={isDark ? '#94a3b8' : '#64748b'} strokeDasharray="3 3" />}
          <Bar dataKey={yKey} name={barName} radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => {
              const val = entry[yKey];
              let color = '#3b82f6';
              if (isAnomaly) {
                color = val >= 0 ? '#ef4444' : '#3b82f6';
              }
              return <Cell key={`cell-${index}`} fill={color} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
