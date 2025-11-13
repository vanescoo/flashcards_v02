
import React from 'react';
import { Word } from '../types.ts';

interface SessionSummaryProps {
  newWords: Word[];
  repeatedWords: Word[];
  onStartNewSession: () => void;
}

const WordTable = ({ title, words }: { title: string; words: Word[] }) => (
  <div className="w-full">
    <h3 className="text-xl font-semibold text-indigo-400 mb-3">{title} ({words.length})</h3>
    <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-3 text-sm font-semibold tracking-wide">Word</th>
              <th className="p-3 text-sm font-semibold tracking-wide">Translation</th>
              <th className="p-3 text-sm font-semibold tracking-wide">Level</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {words.length > 0 ? (
              words.map((word, index) => (
                <tr key={word.id || index} className="hover:bg-gray-700/50">
                  <td className="p-3 text-sm text-white font-medium">{word.word}</td>
                  <td className="p-3 text-sm text-gray-300">{word.translation}</td>
                  <td className="p-3 text-sm">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-600 text-indigo-100">
                      {word.cefrLevel}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="p-3 text-center text-gray-400">No words in this category.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default function SessionSummary({ newWords, repeatedWords, onStartNewSession }: SessionSummaryProps) {
  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-gray-800/50 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-center mb-6 text-white">Session Complete!</h2>
      <div className="space-y-8">
        <WordTable title="New Words Learnt" words={newWords} />
        <WordTable title="Words Repeated" words={repeatedWords} />
      </div>
      <div className="text-center mt-8">
        <button
          onClick={onStartNewSession}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform transform hover:scale-105"
        >
          Start New Session
        </button>
      </div>
    </div>
  );
}
