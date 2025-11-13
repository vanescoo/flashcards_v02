
import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext.tsx';
import { CEFR_DESCRIPTIONS } from '../constants.ts';

const StatCard = ({ label, value }: { label: string; value: string | number }) => (
  <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
    <p className="text-sm text-gray-400 mb-1">{label}</p>
    <p className="text-2xl font-bold text-white">{value}</p>
  </div>
);

export default function StatsView() {
  const { revisionStats, wordBank, currentCefrLevel } = useContext(AppContext);

  if (!revisionStats) {
    return (
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Revision Stats</h2>
        <p className="text-gray-400">No revision data yet. Complete a practice session to see your stats!</p>
      </div>
    );
  }

  const lastRevisedDate = new Date(revisionStats.lastRevised).toLocaleString();

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
      <h2 className="text-3xl font-bold mb-8 text-white text-center">Your Progress</h2>
      
      <div className="mb-10">
        <h3 className="text-xl font-semibold text-indigo-400 mb-4">Current Status</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Current CEFR Level" value={`${currentCefrLevel} (${CEFR_DESCRIPTIONS[currentCefrLevel]})`} />
            <StatCard label="Total Words in Bank" value={wordBank.length} />
            <StatCard label="Next Session Starts At" value={revisionStats.endCEFRLevel} />
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-indigo-400 mb-4">Last Session Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Last Revised" value={lastRevisedDate} />
          <StatCard label="Revision Length" value={revisionStats.revisionLength} />
          <StatCard label="Total Words Reviewed" value={revisionStats.totalWords} />
          <StatCard label="New Words Learnt" value={revisionStats.newWords} />
        </div>
      </div>
    </div>
  );
}
