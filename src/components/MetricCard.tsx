import React from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  subtext?: string;
  badge?: string;
  badgeColor?: 'blue' | 'amber' | 'emerald' | 'rose' | 'slate';
  icon?: React.ReactNode;
  trendDelta?: string; // e.g. "+0.42 °C / decade"
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtext,
  badge,
  badgeColor = 'slate',
  icon,
  trendDelta,
}) => {
  const getBadgeStyle = () => {
    switch (badgeColor) {
      case 'blue':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
      case 'amber':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
      case 'emerald':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
      case 'rose':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        {icon && <div className="text-slate-400 dark:text-slate-500">{icon}</div>}
      </div>

      <div className="flex items-baseline space-x-2">
        <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</div>
        {badge && (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getBadgeStyle()}`}>
            {badge}
          </span>
        )}
      </div>

      {trendDelta && (
        <div className="mt-1 flex items-center text-xs font-medium text-indigo-600 dark:text-indigo-400">
          <span>Trend: {trendDelta}</span>
        </div>
      )}

      {subtext && <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtext}</div>}
    </div>
  );
};
