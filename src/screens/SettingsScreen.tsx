import React from 'react';
import { Settings as SettingsIcon, Trash2, ExternalLink, ShieldCheck, Moon, Sun, Monitor } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TempUnit, WindUnit, PrecipUnit, ThemeMode } from '../models/weather';

export const SettingsScreen: React.FC = () => {
  const { settings, updateSettings, clearAllCache } = useApp();

  const handleTempUnit = (unit: TempUnit) => updateSettings({ tempUnit: unit });
  const handleWindUnit = (unit: WindUnit) => updateSettings({ windUnit: unit });
  const handlePrecipUnit = (unit: PrecipUnit) => updateSettings({ precipUnit: unit });
  const handleTheme = (theme: ThemeMode) => updateSettings({ theme });

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
          <SettingsIcon className="w-6 h-6 text-slate-600 dark:text-slate-400" />
          <span>App Settings</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure units, theme, baseline defaults & local data cache
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Temperature Unit */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 shadow-2xs">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Temperature Unit</label>
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <button
              onClick={() => handleTempUnit('C')}
              className={`py-2 rounded-xl border transition-all cursor-pointer ${
                settings.tempUnit === 'C'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-800'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              Celsius (°C)
            </button>
            <button
              onClick={() => handleTempUnit('F')}
              className={`py-2 rounded-xl border transition-all cursor-pointer ${
                settings.tempUnit === 'F'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-800'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              Fahrenheit (°F)
            </button>
          </div>
        </div>

        {/* Wind Speed Unit */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 shadow-2xs">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Wind Speed Unit</label>
          <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
            <button
              onClick={() => handleWindUnit('kmh')}
              className={`py-2 rounded-xl border transition-all cursor-pointer ${
                settings.windUnit === 'kmh'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-800'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              km/h
            </button>
            <button
              onClick={() => handleWindUnit('ms')}
              className={`py-2 rounded-xl border transition-all cursor-pointer ${
                settings.windUnit === 'ms'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-800'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              m/s
            </button>
            <button
              onClick={() => handleWindUnit('mph')}
              className={`py-2 rounded-xl border transition-all cursor-pointer ${
                settings.windUnit === 'mph'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-800'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              mph
            </button>
          </div>
        </div>

        {/* Precipitation Unit */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 shadow-2xs">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Precipitation Unit</label>
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <button
              onClick={() => handlePrecipUnit('mm')}
              className={`py-2 rounded-xl border transition-all cursor-pointer ${
                settings.precipUnit === 'mm'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-800'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              Millimeters (mm)
            </button>
            <button
              onClick={() => handlePrecipUnit('inch')}
              className={`py-2 rounded-xl border transition-all cursor-pointer ${
                settings.precipUnit === 'inch'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-800'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              Inches (in)
            </button>
          </div>
        </div>

        {/* Theme Selection */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 shadow-2xs">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Theme</label>
          <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
            <button
              onClick={() => handleTheme('system')}
              className={`py-2 rounded-xl border flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                settings.theme === 'system'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-800'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>System</span>
            </button>
            <button
              onClick={() => handleTheme('light')}
              className={`py-2 rounded-xl border flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                settings.theme === 'light'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-800'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Light</span>
            </button>
            <button
              onClick={() => handleTheme('dark')}
              className={`py-2 rounded-xl border flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                settings.theme === 'dark'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-800'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Dark</span>
            </button>
          </div>
        </div>

        {/* Cache Control */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 shadow-2xs md:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Local Data Cache</label>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Clear cached historical weather responses from Open-Meteo
              </span>
            </div>
            <button
              onClick={() => {
                clearAllCache();
                alert('Local weather cache cleared successfully.');
              }}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-semibold hover:bg-rose-100 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Cache</span>
            </button>
          </div>
        </div>

        {/* Open-Meteo Attribution Mandatory Card */}
        <div className="bg-slate-100 dark:bg-slate-900/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 text-center space-y-2 md:col-span-2">
          <div className="flex items-center justify-center space-x-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Open-Meteo API Attribution</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Weather data provided by Open-Meteo under Creative Commons Attribution 4.0 International license.
          </p>
          <a
            href="https://open-meteo.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <span>Weather data by Open-Meteo</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
