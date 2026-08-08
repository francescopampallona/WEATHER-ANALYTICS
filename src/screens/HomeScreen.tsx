import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Calendar,
  BarChart3,
  TrendingUp,
  GitCompare,
  Trophy,
  Sun,
  CloudRain,
  Wind,
  Search,
  ChevronRight,
  Layers,
  Thermometer,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getCurrentWeather } from '../services/weatherApi';
import { CurrentWeather } from '../models/weather';
import { formatTemp, formatWind, formatPrecip } from '../utils/units';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';

interface HomeScreenProps {
  onNavigate: (viewId: string) => void;
  onOpenSearch: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate, onOpenSearch }) => {
  const { location, settings } = useApp();
  const [current, setCurrent] = useState<CurrentWeather | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrent = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCurrentWeather(location);
      setCurrent(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load current weather');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrent();
  }, [location]);

  const cards = [
    {
      id: 'same_day',
      title: 'Same Day Through Years',
      desc: 'Compare e.g. 1 August from 1985 to 2026',
      icon: <Calendar className="w-5 h-5 text-amber-500" />,
      bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50',
    },
    {
      id: 'historical_explorer',
      title: 'Historical Explorer',
      desc: 'Deep dive into custom date range time series',
      icon: <Layers className="w-5 h-5 text-blue-500" />,
      bg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50',
    },
    {
      id: 'monthly',
      title: 'Monthly Analysis',
      desc: 'Analyze specific month trends across decades',
      icon: <BarChart3 className="w-5 h-5 text-indigo-500" />,
      bg: 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900/50',
    },
    {
      id: 'annual',
      title: 'Annual Analysis',
      desc: 'Yearly averages, hot days (>35°C), frost days',
      icon: <Sun className="w-5 h-5 text-rose-500" />,
      bg: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50',
    },
    {
      id: 'records',
      title: 'Weather Records',
      desc: 'All-time extremes, wettest months & dry streaks',
      icon: <Trophy className="w-5 h-5 text-emerald-500" />,
      bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50',
    },
    {
      id: 'compare',
      title: 'Compare Locations',
      desc: 'Side-by-side weather & climate comparison',
      icon: <GitCompare className="w-5 h-5 text-purple-500" />,
      bg: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900/50',
    },
    {
      id: 'trends',
      title: 'Climate Trends',
      desc: '5 & 10-year moving averages & linear regression',
      icon: <TrendingUp className="w-5 h-5 text-cyan-500" />,
      bg: 'bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-900/50',
    },
  ];

  return (
    <div className="flex-1 space-y-6">
      {/* Section Sub-header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Live Weather & Climate Dashboard
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Current conditions and direct access to Open-Meteo historical climate analytics
          </p>
        </div>
      </div>

      {/* Current Conditions Card */}
      {loading ? (
        <LoadingState message="Connecting to Open-Meteo Forecast API..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchCurrent} />
      ) : current ? (
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-800 dark:from-blue-950 dark:via-indigo-950 dark:to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden border border-blue-500/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center space-x-2 text-blue-100 text-sm font-medium">
                <MapPin className="w-4 h-4 text-blue-300" />
                <span>
                  {location.name}, {[location.admin1, location.country].filter(Boolean).join(', ')}
                </span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-mono text-white/90">
                  Real Open-Meteo
                </span>
              </div>
              <div className="text-5xl sm:text-6xl font-black mt-3 tracking-tight">
                {formatTemp(current.temperature, settings.tempUnit)}
              </div>
              <div className="text-base font-semibold text-blue-100 mt-2 flex items-center gap-2">
                <span>{current.weatherDescription}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-white/15 text-sm text-blue-50">
              <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
                <div className="text-xs text-blue-200 opacity-80">High / Low</div>
                <div className="font-bold font-mono mt-0.5">
                  {formatTemp(current.tempMax, settings.tempUnit)} / {formatTemp(current.tempMin, settings.tempUnit)}
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10 flex items-center space-x-2.5">
                <CloudRain className="w-5 h-5 text-blue-300 shrink-0" />
                <div>
                  <div className="text-xs text-blue-200 opacity-80">Precipitation</div>
                  <div className="font-bold mt-0.5">{formatPrecip(current.precipitation, settings.precipUnit)}</div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10 flex items-center space-x-2.5">
                <Wind className="w-5 h-5 text-blue-300 shrink-0" />
                <div>
                  <div className="text-xs text-blue-200 opacity-80">Wind Speed</div>
                  <div className="font-bold mt-0.5">{formatWind(current.windSpeed, settings.windUnit)}</div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10 flex items-center space-x-2.5">
                <Thermometer className="w-5 h-5 text-blue-300 shrink-0" />
                <div>
                  <div className="text-xs text-blue-200 opacity-80">Feels Like</div>
                  <div className="font-bold mt-0.5">
                    {formatTemp(current.apparentTemperature ?? current.temperature, settings.tempUnit)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Analytics Category Cards */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Climate & Historical Frameworks
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">
            Query 40+ years of Open-Meteo weather records
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3.5">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => onNavigate(card.id)}
              className={`w-full text-left p-4 rounded-2xl border ${card.bg} flex items-start justify-between transition-all hover:scale-[1.01] active:scale-[0.99] hover:shadow-md shadow-2xs group cursor-pointer`}
            >
              <div className="flex items-start space-x-3.5">
                <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                  {card.icon}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {card.title}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{card.desc}</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0 mt-1 transition-transform group-hover:translate-x-0.5" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
