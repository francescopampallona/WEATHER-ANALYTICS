import React from 'react';
import { Home, BarChart2, GitCompare, Trophy, Settings } from 'lucide-react';

export type ScreenTab = 'home' | 'explore' | 'compare' | 'records' | 'settings';

interface BottomNavProps {
  activeTab: ScreenTab;
  onTabChange: (tab: ScreenTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: ScreenTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'explore', label: 'Explore', icon: <BarChart2 className="w-5 h-5" /> },
    { id: 'compare', label: 'Compare', icon: <GitCompare className="w-5 h-5" /> },
    { id: 'records', label: 'Records', icon: <Trophy className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <nav className="md:hidden sticky bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-around z-40 select-none shadow-lg">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              isActive
                ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium'
            }`}
          >
            {tab.icon}
            <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
