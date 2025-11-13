
import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext.tsx';
import { View, LANGUAGES } from '../types.ts';
import SparklesIcon from './icons/SparklesIcon.tsx';
import BookOpenIcon from './icons/BookOpenIcon.tsx';
import ChartBarIcon from './icons/ChartBarIcon.tsx';
import CogIcon from './icons/CogIcon.tsx';

interface HeaderProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

export default function Header({ currentView, setCurrentView }: HeaderProps) {
  const { language, setLanguage } = useContext(AppContext);

  const NavButton = ({ view, label, icon }: { view: View; label: string; icon: React.ReactNode }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        currentView === view
          ? 'bg-indigo-600 text-white'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      }`}
      aria-current={currentView === view ? 'page' : undefined}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <header className="w-full bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-40">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="text-xl font-bold text-white">Gemini Flashcards</span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2 sm:gap-4">
              <NavButton view="practice" label="Practice" icon={<SparklesIcon />} />
              <NavButton view="wordbank" label="Word Bank" icon={<BookOpenIcon />} />
              <NavButton view="stats" label="Stats" icon={<ChartBarIcon />} />
              <NavButton view="settings" label="Settings" icon={<CogIcon />} />
            </div>
            <div className="flex items-center">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="bg-gray-700 border border-gray-600 rounded-md py-2 pl-3 pr-8 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Select language"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
