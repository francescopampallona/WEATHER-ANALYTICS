import React from 'react';
import {
  Calendar,
  Layers,
  BarChart3,
  Sun,
  Trophy,
  TrendingUp,
  Sliders,
  Clock,
  Flame,
  ChevronRight,
} from 'lucide-react';

interface ExploreScreenProps {
  onNavigate: (viewId: string) => void;
}

export const ExploreScreen: React.FC<ExploreScreenProps> = ({ onNavigate }) => {
  const tools = [
    {
      id: 'same_day',
      title: 'Same Day Through Years',
      subtitle: 'Analyze a single calendar day across decades (e.g. Aug 1, 1985–2026)',
      icon: <Calendar className="w-5 h-5 text-amber-500" />,
      badge: 'Primary Feature',
    },
    {
      id: 'historical_explorer',
      title: 'Historical Explorer',
      subtitle: 'Query arbitrary historical date ranges & time series',
      icon: <Layers className="w-5 h-5 text-blue-500" />,
    },
    {
      id: 'monthly',
      title: 'Monthly Analysis',
      subtitle: 'Track month-by-month averages, rainfall totals & peak max temps',
      icon: <BarChart3 className="w-5 h-5 text-indigo-500" />,
    },
    {
      id: 'annual',
      title: 'Annual Analysis',
      subtitle: 'Yearly climate summaries, hot days count (>30°C, >35°C) & frost days',
      icon: <Sun className="w-5 h-5 text-rose-500" />,
    },
    {
      id: 'records',
      title: 'Weather Records',
      subtitle: 'Historical max/min temperatures, wettest days/months & dry streaks',
      icon: <Trophy className="w-5 h-5 text-emerald-500" />,
    },
    {
      id: 'trends',
      title: 'Climate Trends',
      subtitle: '5-year & 10-year moving averages with linear regression trendline',
      icon: <TrendingUp className="w-5 h-5 text-cyan-500" />,
    },
    {
      id: 'anomalies',
      title: 'Weather Anomalies',
      subtitle: 'Compare yearly temperatures against a baseline period (e.g. 1991–2020)',
      icon: <Sliders className="w-5 h-5 text-purple-500" />,
    },
    {
      id: 'decades',
      title: 'Decade Comparison',
      subtitle: 'Side-by-side decade breakdown (1980s, 1990s, 2000s, 2010s, 2020s)',
      icon: <Clock className="w-5 h-5 text-teal-500" />,
    },
    {
      id: 'extremes',
      title: 'Extreme Events Analysis',
      subtitle: 'Count days exceeding heat, cold, or precipitation thresholds',
      icon: <Flame className="w-5 h-5 text-orange-500" />,
    },
  ];

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Explorer & Analytical Tools
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Select an analytical framework to query real Open-Meteo historical climate datasets
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="w-full text-left p-4 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs hover:shadow-lg hover:border-blue-500/50 dark:hover:border-blue-400/50 transition-all flex items-start justify-between group cursor-pointer"
          >
            <div className="flex items-start space-x-3.5">
              <div className="p-2.5 bg-slate-100 dark:bg-slate-700/60 rounded-xl group-hover:scale-105 transition-transform shrink-0">
                {item.icon}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </span>
                  {item.badge && (
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {item.subtitle}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0 mt-1 transition-transform group-hover:translate-x-0.5" />
          </button>
        ))}
      </div>
    </div>
  );
};
