
import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext.tsx';
import { Word } from '../types.ts';

const formatLastReviewed = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};

const formatNextReview = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = (date.getTime() - now.getTime()) / 1000;
    
    if (diffSeconds <= 0) return 'Due now';

    const diffMinutes = Math.round(diffSeconds / 60);
    if (diffMinutes < 60) return `in ${diffMinutes} min`;

    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) return `in ${diffHours} hr`;

    const diffDays = Math.round(diffHours / 24);
    return `in ${diffDays} days`;
};

const SrsLevelTable = ({ level, words }: { level: number, words: Word[] }) => (
    <div>
        <h3 className="text-2xl font-semibold text-indigo-400 mb-4">SRS Level {level} <span className="text-base font-normal text-gray-400">({words.length} words)</span></h3>
        <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-700">
                        <tr>
                            <th className="p-4 text-sm font-semibold tracking-wide">Word</th>
                            <th className="p-4 text-sm font-semibold tracking-wide">Translation</th>
                            <th className="p-4 text-sm font-semibold tracking-wide">Last Reviewed</th>
                            <th className="p-4 text-sm font-semibold tracking-wide">Next Review</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {words.sort((a, b) => new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime()).map((word) => (
                            <tr key={word.id} className="hover:bg-gray-700/50">
                                <td className="p-4 text-sm text-white font-medium">{word.word}</td>
                                <td className="p-4 text-sm text-gray-300">{word.translation}</td>
                                <td className="p-4 text-sm text-gray-300">{formatLastReviewed(word.lastReviewed)}</td>
                                <td className="p-4 text-sm text-indigo-300 font-medium">{formatNextReview(word.nextReview)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

export default function WordBankView() {
  const { wordBank } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredWords = wordBank
    .filter(word => 
      word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      word.translation.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const wordsBySrsLevel = filteredWords.reduce((acc, word) => {
    const level = word.srsLevel;
    if (!acc[level]) {
      acc[level] = [];
    }
    acc[level].push(word);
    return acc;
  }, {} as Record<number, Word[]>);

  const sortedSrsLevels = Object.keys(wordsBySrsLevel).map(Number).sort((a, b) => a - b);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6">
      <h2 className="text-3xl font-bold mb-6 text-white">Word Bank ({wordBank.length})</h2>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search words..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full sm:w-1/2 bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="space-y-10">
        {sortedSrsLevels.length > 0 ? (
            sortedSrsLevels.map(level => (
                <SrsLevelTable key={level} level={level} words={wordsBySrsLevel[level]} />
            ))
        ) : (
            <div className="text-center text-gray-400 py-16">
                <p>{wordBank.length === 0 ? "Your word bank is empty. Start a practice session to add words." : "No words match your search."}</p>
            </div>
        )}
      </div>
    </div>
  );
}
