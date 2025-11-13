
import React, { useState, useEffect, useRef } from 'react';
import { CEFRLevel, Language } from '../types.ts';

interface FlashcardProps {
  word: string;
  translation: string;
  exampleSentence: string;
  cefrLevel: CEFRLevel;
  language: Language;
  speak: (text: string, language: Language) => void;
}

export default function Flashcard({ word, translation, exampleSentence, cefrLevel, language, speak }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const isInitialRender = useRef(true);

  // Reset flip state and ref when word changes
  useEffect(() => {
    setIsFlipped(false);
    isInitialRender.current = true;
  }, [word]);

  const handleCardClick = () => {
    setIsFlipped(prev => !prev);
  };

  // Speak on flip, but not on initial render of the front face
  // (which is handled by PracticeView)
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    if (isFlipped) {
      speak(exampleSentence, language);
    } else {
      speak(word, language);
    }
  }, [isFlipped, word, exampleSentence, language, speak]);

  return (
    <div
      className={`card-container w-full h-64 cursor-pointer ${isFlipped ? 'flipped' : ''}`}
      onClick={handleCardClick}
      role="button"
      aria-pressed={isFlipped}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' || e.key === ' ' ? handleCardClick() : null}
    >
      <div className="card-inner">
        <div className="card-front bg-gray-800 shadow-lg p-6 flex flex-col justify-between">
          <div>
            <span className="absolute top-4 left-4 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full">
              {cefrLevel}
            </span>
          </div>
          <h3 className="text-4xl md:text-5xl font-bold text-center text-white">{word}</h3>
          <p className="text-gray-500 text-sm">Click to see translation</p>
        </div>
        <div className="card-back bg-gray-700 shadow-lg p-6 flex flex-col justify-center items-center text-center">
          <h3 className="text-3xl font-bold text-white mb-4">{translation}</h3>
          <p className="text-lg text-gray-200 italic">"{exampleSentence}"</p>
        </div>
      </div>
    </div>
  );
}
