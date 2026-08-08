import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Unable to retrieve weather data from Open-Meteo.',
  onRetry,
}) => {
  return (
    <div className="bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-2xl p-5 text-center my-4">
      <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/60 rounded-full flex items-center justify-center mx-auto mb-3 text-rose-600 dark:text-rose-400">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <h4 className="text-sm font-semibold text-rose-900 dark:text-rose-200">Open-Meteo API Error</h4>
      <p className="text-xs text-rose-700 dark:text-rose-300 mt-1 max-w-sm mx-auto">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium transition-colors shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};
