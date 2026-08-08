import React from 'react';
import { ActiveMetric } from '../models/statistics';
import { Thermometer, CloudRain, Wind } from 'lucide-react';

interface MetricSelectorProps {
  activeMetric: ActiveMetric;
  onChange: (metric: ActiveMetric) => void;
  showWind?: boolean;
}

export const MetricSelector: React.FC<MetricSelectorProps> = ({
  activeMetric,
  onChange,
  showWind = true,
}) => {
  const options: { id: ActiveMetric; label: string; icon: React.ReactNode }[] = [
    { id: 'tempMean', label: 'Mean Temp', icon: <Thermometer className="w-3.5 h-3.5" /> },
    { id: 'tempMin', label: 'Min Temp', icon: <Thermometer className="w-3.5 h-3.5" /> },
    { id: 'tempMax', label: 'Max Temp', icon: <Thermometer className="w-3.5 h-3.5" /> },
    { id: 'precipitation', label: 'Precipitation', icon: <CloudRain className="w-3.5 h-3.5" /> },
  ];

  if (showWind) {
    options.push({ id: 'windSpeedMax', label: 'Max Wind', icon: <Wind className="w-3.5 h-3.5" /> });
  }

  return (
    <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
      {options.map((opt) => {
        const isActive = activeMetric === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`flex items-center space-x-1 px-2.5 py-1.2 rounded-lg text-xs font-medium transition-all ${
              isActive
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {opt.icon}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
