import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav, ScreenTab } from './components/BottomNav';
import { LocationSearchModal } from './components/LocationSearchModal';

// Screens
import { HomeScreen } from './screens/HomeScreen';
import { ExploreScreen } from './screens/ExploreScreen';
import { SameDayScreen } from './screens/SameDayScreen';
import { HistoricalExplorerScreen } from './screens/HistoricalExplorerScreen';
import { MonthlyAnalysisScreen } from './screens/MonthlyAnalysisScreen';
import { SeasonalAnalysisScreen } from './screens/SeasonalAnalysisScreen';
import { AnnualAnalysisScreen } from './screens/AnnualAnalysisScreen';
import { RecordsScreen } from './screens/RecordsScreen';
import { CompareScreen } from './screens/CompareScreen';
import { ClimateTrendsScreen } from './screens/ClimateTrendsScreen';
import { AnomaliesScreen } from './screens/AnomaliesScreen';
import { DecadeComparisonScreen } from './screens/DecadeComparisonScreen';
import { ExtremesScreen } from './screens/ExtremesScreen';
import { SettingsScreen } from './screens/SettingsScreen';

function AppContent() {
  const [activeScreen, setActiveScreen] = useState<string>('home');
  const [activeTab, setActiveTab] = useState<ScreenTab>('home');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  const handleTabChange = (tab: ScreenTab) => {
    setActiveTab(tab);
    if (tab === 'home') setActiveScreen('home');
    else if (tab === 'explore') setActiveScreen('explore');
    else if (tab === 'compare') setActiveScreen('compare');
    else if (tab === 'records') setActiveScreen('records');
    else if (tab === 'settings') setActiveScreen('settings');
  };

  const handleNavigate = (viewId: string) => {
    setActiveScreen(viewId);
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'home':
        return (
          <HomeScreen
            onNavigate={handleNavigate}
            onOpenSearch={() => setIsSearchOpen(true)}
          />
        );
      case 'explore':
        return <ExploreScreen onNavigate={handleNavigate} />;
      case 'same_day':
        return <SameDayScreen onBack={() => setActiveScreen('explore')} />;
      case 'historical_explorer':
        return <HistoricalExplorerScreen onBack={() => setActiveScreen('explore')} />;
      case 'monthly':
        return <MonthlyAnalysisScreen onBack={() => setActiveScreen('explore')} />;
      case 'seasonal':
        return <SeasonalAnalysisScreen onBack={() => setActiveScreen('explore')} />;
      case 'annual':
        return <AnnualAnalysisScreen onBack={() => setActiveScreen('explore')} />;
      case 'records':
        return <RecordsScreen />;
      case 'compare':
        return <CompareScreen onOpenSearch={() => setIsSearchOpen(true)} />;
      case 'trends':
        return <ClimateTrendsScreen onBack={() => setActiveScreen('explore')} />;
      case 'anomalies':
        return <AnomaliesScreen onBack={() => setActiveScreen('explore')} />;
      case 'decades':
        return <DecadeComparisonScreen onBack={() => setActiveScreen('explore')} />;
      case 'extremes':
        return <ExtremesScreen onBack={() => setActiveScreen('explore')} />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return (
          <HomeScreen
            onNavigate={handleNavigate}
            onOpenSearch={() => setIsSearchOpen(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Header Navigation */}
      <Header
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-[1500px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
        {renderScreen()}
      </main>

      {/* Mobile Bottom Navigation (< md) */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Location Search Modal */}
      <LocationSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
