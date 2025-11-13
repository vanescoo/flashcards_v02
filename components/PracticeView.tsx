
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AppContext } from '../context/AppContext.tsx';
import { useGemini } from '../hooks/useGemini.ts';
import { useSpeech } from '../hooks/useSpeech.ts';
import Flashcard from './Flashcard.tsx';
import SessionSummary from './SessionSummary.tsx';
import LoadingSpinner from './icons/LoadingSpinner.tsx';
import ProgressBar from './ProgressBar.tsx';
import { CEFR_LEVELS, CEFRLevel, Word, WordStatus, View } from '../types.ts';
import { NEW_WORDS_PER_SESSION, SRS_INTERVALS_HOURS } from '../constants.ts';

type SessionState = 'practicing' | 'summary';
type CardData = (Omit<Word, 'id' | 'srsLevel' | 'lastReviewed' | 'nextReview'> & { isReview: false }) | (Word & { isReview: true });

const getPreviousCefrLevel = (currentLevel: CEFRLevel): CEFRLevel => {
    const currentIndex = CEFR_LEVELS.indexOf(currentLevel);
    return CEFR_LEVELS[Math.max(currentIndex - 1, 0)];
};

const getNextCefrLevel = (currentLevel: CEFRLevel): CEFRLevel => {
    const currentIndex = CEFR_LEVELS.indexOf(currentLevel);
    return CEFR_LEVELS[Math.min(currentIndex + 1, CEFR_LEVELS.length - 1)];
};

const calculateNextReview = (srsLevel: number): string => {
    const now = new Date();
    const hoursToAdd = SRS_INTERVALS_HOURS[srsLevel] || SRS_INTERVALS_HOURS[8];
    now.setHours(now.getHours() + hoursToAdd);
    return now.toISOString();
};

interface PracticeViewProps {
  setCurrentView: (view: View) => void;
}

export default function PracticeView({ setCurrentView }: PracticeViewProps) {
  const { apiKey, language, currentCefrLevel, setCurrentCefrLevel, wordBank, upsertWordInBank, updateRevisionStats } = useContext(AppContext);
  const { generateWord, isLoading, error } = useGemini();
  const { speak } = useSpeech();

  const [sessionState, setSessionState] = useState<SessionState>('practicing');
  const [currentCard, setCurrentCard] = useState<CardData | null>(null);
  
  const [newWordsThisSession, setNewWordsThisSession] = useState(0);
  const [consecutiveNewWordClicks, setConsecutiveNewWordClicks] = useState(0);
  
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [sessionSummaryData, setSessionSummaryData] = useState<{ new: Word[], repeated: Word[] }>({ new: [], repeated: [] });

  useEffect(() => {
    if (currentCard) {
      speak(currentCard.word, language);
    }
  }, [currentCard, language, speak]);

  const prepareNextCard = useCallback(async () => {
    if (!apiKey) return;
    const now = new Date().toISOString();
    const dueWords = wordBank
        .filter(w => w.nextReview <= now)
        .sort((a, b) => new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime());

    if (dueWords.length > 0) {
        setCurrentCard({ ...dueWords[0], isReview: true });
    } else {
        const wordsToExclude = wordBank.map(w => w.word);
        const newWordData = await generateWord(language, currentCefrLevel, wordsToExclude);
        if (newWordData) {
            setCurrentCard({ ...newWordData, cefrLevel: currentCefrLevel, isReview: false });
        }
    }
  }, [apiKey, wordBank, generateWord, language, currentCefrLevel]);

  const startNewSession = useCallback(() => {
    setSessionState('practicing');
    setNewWordsThisSession(0);
    setConsecutiveNewWordClicks(0);
    setSessionSummaryData({ new: [], repeated: [] });
    setCurrentCard(null);
    setSessionStartTime(Date.now());
  }, []);

  useEffect(() => {
    startNewSession();
  }, [language, startNewSession]);

  useEffect(() => {
    if (sessionState === 'practicing' && !currentCard && !isLoading) {
      prepareNextCard();
    }
  }, [sessionState, currentCard, isLoading, prepareNextCard]);

  const handleWordReviewed = (status: WordStatus) => {
    if (!currentCard || isLoading) return;

    const now = new Date().toISOString();
    let wordToUpsert: Word | null = null;
    let isSessionEnding = false;

    const updatedSummaryData = {
        new: [...sessionSummaryData.new],
        repeated: [...sessionSummaryData.repeated],
    };

    if (status === 'easy') { // "I Know It"
        setConsecutiveNewWordClicks(0);
        setCurrentCefrLevel(prevLevel => getNextCefrLevel(prevLevel));
        if (currentCard.isReview) {
            const newSrsLevel = Math.min(currentCard.srsLevel + 1, 8);
            wordToUpsert = { ...currentCard, srsLevel: newSrsLevel, lastReviewed: now, nextReview: calculateNextReview(newSrsLevel) };
            updatedSummaryData.repeated.push(wordToUpsert);
        }
    } else if (status === 'known') { // "Remind Me Later"
        setConsecutiveNewWordClicks(0);
        const srsLevel = currentCard.isReview ? currentCard.srsLevel : 1;
        const id = currentCard.isReview ? currentCard.id : `${currentCard.word}-${currentCard.translation}`;
        wordToUpsert = { ...currentCard, id, srsLevel, lastReviewed: now, nextReview: calculateNextReview(srsLevel) };
        
        updatedSummaryData.repeated.push(wordToUpsert);

    } else if (status === 'new') { // "New Word"
        if (!currentCard.isReview) {
            const newConsecutiveCount = consecutiveNewWordClicks + 1;
            setConsecutiveNewWordClicks(newConsecutiveCount);
            if (newConsecutiveCount >= 3) {
                setCurrentCefrLevel(getPreviousCefrLevel(currentCefrLevel));
                setConsecutiveNewWordClicks(0);
            }
            
            const id = `${currentCard.word}-${currentCard.translation}`;
            wordToUpsert = { ...currentCard, id, srsLevel: 1, lastReviewed: now, nextReview: calculateNextReview(1) };
            updatedSummaryData.new.push(wordToUpsert);
            
            const updatedNewWordsCount = newWordsThisSession + 1;
            setNewWordsThisSession(updatedNewWordsCount);

            if (updatedNewWordsCount >= NEW_WORDS_PER_SESSION) {
                isSessionEnding = true;
            }
        }
    }

    setSessionSummaryData(updatedSummaryData);
    if (wordToUpsert) {
        upsertWordInBank(wordToUpsert);
    }
    
    if (isSessionEnding) {
        const sessionEndTime = Date.now();
        const durationInSeconds = Math.round((sessionEndTime - sessionStartTime!) / 1000);
        const minutes = Math.floor(durationInSeconds / 60);
        const seconds = durationInSeconds % 60;

        updateRevisionStats({
          lastRevised: new Date().toISOString(),
          revisionLength: `${minutes}m ${seconds}s`,
          totalWords: updatedSummaryData.new.length + updatedSummaryData.repeated.length,
          newWords: updatedSummaryData.new.length,
        });
        setSessionState('summary');
    } else {
        setCurrentCard(null);
    }
  };

  if (!apiKey) {
    return (
        <div className="text-center bg-gray-800 p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-4">API Key Required</h2>
            <p className="text-gray-400 mb-6">Please set your Gemini API key in the settings to start practicing.</p>
            <button 
                onClick={() => setCurrentView('settings')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-md"
            >
                Go to Settings
            </button>
        </div>
    );
  }

  if (sessionState === 'summary') {
    return (
      <SessionSummary
        newWords={sessionSummaryData.new}
        repeatedWords={sessionSummaryData.repeated}
        onStartNewSession={startNewSession}
      />
    );
  }

  const showLoading = isLoading || (!currentCard && sessionState === 'practicing');

  return (
    <div className="w-full max-w-2xl flex flex-col items-center">
      {showLoading && (
        <div className="flex flex-col items-center justify-center h-64">
          <LoadingSpinner />
          <p className="mt-4 text-gray-400">Preparing next card...</p>
        </div>
      )}
      {error && <p className="text-red-400">Error: {error}</p>}
      
      {!showLoading && currentCard && (
        <>
          <div className="w-full max-w-md mb-8">
            <Flashcard 
              word={currentCard.word} 
              translation={currentCard.translation} 
              exampleSentence={currentCard.exampleSentence}
              cefrLevel={currentCard.cefrLevel}
              language={language}
              speak={speak}
            />
          </div>
          <div className="grid grid-cols-3 gap-4 w-full max-w-md">
            <button onClick={() => handleWordReviewed('easy')} disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50">
              I Know It
            </button>
            <button onClick={() => handleWordReviewed('known')} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50">
              Remind Me Later
            </button>
            <button onClick={() => handleWordReviewed('new')} disabled={isLoading || currentCard.isReview} className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
              New Word
            </button>
          </div>

          <div className="w-full max-w-md mt-8">
            <ProgressBar progress={(newWordsThisSession / NEW_WORDS_PER_SESSION) * 100} />
            <p className="text-center text-sm text-gray-400 mt-2">
              New words this session: {newWordsThisSession} / {NEW_WORDS_PER_SESSION}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
