import React, { createContext, useContext, useState, useEffect } from 'react';
import { Location } from '../models/location';
import { AppSettings, ThemeMode } from '../models/weather';
import { DEFAULT_LOCATION, getRecentLocations, saveRecentLocation } from '../services/geocodingApi';
import { cacheService } from '../services/cacheService';

interface AppContextType {
  location: Location;
  setLocation: (loc: Location) => void;
  recentLocations: Location[];
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  clearAllCache: () => void;
  isDark: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  tempUnit: 'C',
  windUnit: 'kmh',
  precipUnit: 'mm',
  theme: 'system',
  defaultStartYear: 1985,
  defaultBaselineStart: 1991,
  defaultBaselineEnd: 2020,
};

const SETTINGS_KEY = 'weather_analytics_user_settings';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocationState] = useState<Location>(() => {
    const recents = getRecentLocations();
    return recents[0] || DEFAULT_LOCATION;
  });

  const [recentLocations, setRecentLocations] = useState<Location[]>(() => getRecentLocations());

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
      }
    } catch (e) {}
    return DEFAULT_SETTINGS;
  });

  const [isDark, setIsDark] = useState<boolean>(false);

  // Apply Theme effect
  useEffect(() => {
    const applyTheme = () => {
      let dark = false;
      if (settings.theme === 'dark') {
        dark = true;
      } else if (settings.theme === 'system') {
        dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      setIsDark(dark);
      if (dark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();

    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e: MediaQueryListEvent) => {
        setIsDark(e.matches);
        if (e.matches) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
      };
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [settings.theme]);

  const setLocation = (newLoc: Location) => {
    setLocationState(newLoc);
    saveRecentLocation(newLoc);
    setRecentLocations(getRecentLocations());
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const clearAllCache = () => {
    cacheService.clearAll();
  };

  return (
    <AppContext.Provider
      value={{
        location,
        setLocation,
        recentLocations,
        settings,
        updateSettings,
        clearAllCache,
        isDark,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
};
