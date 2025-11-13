
import React, { useState, useContext } from 'react';
import { AppContext } from './context/AppContext.tsx';
import LoginModal from './components/LoginModal.tsx';
import Header from './components/Header.tsx';
import PracticeView from './components/PracticeView.tsx';
import WordBankView from './components/WordBankView.tsx';
import StatsView from './components/StatsView.tsx';
import SettingsView from './components/SettingsView.tsx';
import { View } from './types.ts';

export default function App() {
  const { userId } = useContext(AppContext);
  const [currentView, setCurrentView] = useState<View>('practice');

  const renderView = () => {
    switch (currentView) {
      case 'wordbank':
        return <WordBankView />;
      case 'stats':
        return <StatsView />;
      case 'settings':
        return <SettingsView />;
      case 'practice':
      default:
        return <PracticeView setCurrentView={setCurrentView} />;
    }
  };

  if (!userId) {
    return <LoginModal />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8">
        {renderView()}
      </main>
    </div>
  );
}
