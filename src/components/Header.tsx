import React from 'react';
import {
  CloudSun,
  MapPin,
  Search,
  Home,
  BarChart2,
  GitCompare,
  Trophy,
  Settings as SettingsIcon,
  Sun,
  Moon,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ScreenTab } from './BottomNav';

interface HeaderProps {
  activeTab: ScreenTab;
  onTabChange: (tab: ScreenTab) => void;
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange, onOpenSearch }) => {
  const { location, settings, updateSettings } = useApp();

  const toggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: nextTheme });
  };

  const navItems: { id: ScreenTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { id: 'explore', label: 'Explore', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'compare', label: 'Compare', icon: <GitCompare className="w-4 h-4" /> },
    { id: 'records', label: 'Records', icon: <Trophy className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Title */}
        <div className="flex items-center space-x-3 cursor-pointer shrink-0" onClick={() => onTabChange('home')}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <CloudSun className="w-6 h-6" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Weather Analytics</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
              Explore decades of weather data
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Action Items: Location Search & Theme Toggle */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Location Picker Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center space-x-2 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700/80 transition-all shadow-2xs"
            title="Change Location"
          >
            <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="max-w-[100px] sm:max-w-[160px] truncate">{location.name}</span>
            <Search className="w-3.5 h-3.5 text-slate-400 ml-0.5 shrink-0" />
          </button>

          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700/80 transition-all"
            title="Toggle Theme"
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
