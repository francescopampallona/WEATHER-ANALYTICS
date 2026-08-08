import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  subtext?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Fetching weather data from Open-Meteo...',
  subtext = 'Processing historical records and calculating climate statistics',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[220px]">
      <Loader2 className="w-9 h-9 text-blue-600 dark:text-blue-400 animate-spin mb-3" />
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{message}</p>
      {subtext && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">{subtext}</p>}
    </div>
  );
};
