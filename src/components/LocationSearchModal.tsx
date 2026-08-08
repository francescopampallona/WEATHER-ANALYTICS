import React, { useState, useEffect } from 'react';
import { Search, MapPin, X, History, Loader2, Navigation } from 'lucide-react';
import { Location } from '../models/location';
import { searchLocations } from '../services/geocodingApi';
import { useApp } from '../context/AppContext';

interface LocationSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationSearchModal: React.FC<LocationSearchModalProps> = ({ isOpen, onClose }) => {
  const { location, setLocation, recentLocations } = useApp();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const locs = await searchLocations(query);
        setResults(locs);
      } catch (err: any) {
        setError(err.message || 'Location search failed');
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (loc: Location) => {
    setLocation(loc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 px-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Search Location</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-700/60">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Caltagirone, Dublin, Rome, Tokyo..."
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            {loading && (
              <Loader2 className="w-4 h-4 absolute right-3 top-3 text-blue-600 dark:text-blue-400 animate-spin" />
            )}
          </div>
        </div>

        {/* Results / Recents List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && <div className="text-xs text-rose-600 dark:text-rose-400 p-2">{error}</div>}

          {query.trim().length >= 2 ? (
            <div>
              <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Search Results ({results.length})
              </div>
              {results.length === 0 && !loading ? (
                <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                  No cities found for "{query}". Try another query.
                </div>
              ) : (
                <div className="space-y-1">
                  {results.map((item) => {
                    const isCurrent = item.id === location.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between transition-colors ${
                          isCurrent
                            ? 'bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center space-x-1.5">
                            <span>{item.name}</span>
                            {isCurrent && (
                              <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded-full font-bold">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {[item.admin1, item.country].filter(Boolean).join(', ')}
                          </div>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 text-right">
                          {item.latitude.toFixed(2)}°, {item.longitude.toFixed(2)}°
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 flex items-center space-x-1">
                <History className="w-3.5 h-3.5" />
                <span>Recent Searches</span>
              </div>
              <div className="space-y-1">
                {recentLocations.map((item) => {
                  const isCurrent = item.id === location.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between transition-colors ${
                        isCurrent
                          ? 'bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Navigation className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        <div>
                          <div className="text-sm font-semibold text-slate-900 dark:text-white">
                            {item.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {[item.admin1, item.country].filter(Boolean).join(', ')}
                          </div>
                        </div>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                        {item.latitude.toFixed(2)}°, {item.longitude.toFixed(2)}°
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
