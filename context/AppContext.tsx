
import React, { createContext, ReactNode, useCallback, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage.ts';
import { Language, CEFRLevel, Word, RevisionStat, LANGUAGES, CEFR_LEVELS } from '../types.ts';
import { GoogleGenAI } from '@google/genai';

interface AppContextType {
  userId: string | null;
  login: (id: string) => void;
  logout: () => void;
  apiKey: string | null;
  isSavingKey: boolean;
  saveApiKey: (key: string) => Promise<boolean>;
  authError: string | null;
  setAuthError: (error: string | null) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  currentCefrLevel: CEFRLevel;
  setCurrentCefrLevel: (level: CEFRLevel) => void;
  wordBank: Word[];
  upsertWordInBank: (word: Word) => void;
  revisionStats: RevisionStat | null;
  updateRevisionStats: (stats: Omit<RevisionStat, 'endCEFRLevel'>) => void;
}

export const AppContext = createContext<AppContextType>({} as AppContextType);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useLocalStorage<string | null>('flashcards-user-id', null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSavingKey, setIsSavingKey] = useState(false);

  const [apiKey, setApiKey] = useLocalStorage<string | null>(userId ? `user-${userId}-api-key` : null, null);
  const [language, setLanguage] = useLocalStorage<Language>(userId ? `user-${userId}:language` : null, LANGUAGES[0]);
  const dataScopeKey = userId && language ? `user-${userId}:${language}` : null;

  const [currentCefrLevel, setCurrentCefrLevel] = useLocalStorage<CEFRLevel>(dataScopeKey ? `${dataScopeKey}:cefr-level` : null, CEFR_LEVELS[0]);
  const [wordBank, setWordBank] = useLocalStorage<Word[]>(dataScopeKey ? `${dataScopeKey}:word-bank` : null, []);
  const [revisionStats, setRevisionStats] = useLocalStorage<RevisionStat | null>(dataScopeKey ? `${dataScopeKey}:revision-stats` : null, null);

  const login = useCallback((id: string) => {
    setAuthError(null);
    setUserId(id);
  }, [setUserId]);

  const logout = useCallback(() => {
    setUserId(null);
    setApiKey(null); // Clear API key on logout
  }, [setUserId, setApiKey]);

  const saveApiKey = useCallback(async (key: string): Promise<boolean> => {
    setAuthError(null);
    setIsSavingKey(true);
    try {
      const ai = new GoogleGenAI({ apiKey: key, vertexai: true });
      await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: { role: 'user', parts: [{ text: 'hello' }] }
      });
      setApiKey(key);
      setIsSavingKey(false);
      return true;
    } catch (err) {
      console.error("API Key validation failed:", err);
      setAuthError("API key is not valid. Please check your key and try again.");
      setApiKey(null);
      setIsSavingKey(false);
      return false;
    }
  }, [setApiKey]);

  const upsertWordInBank = useCallback((wordToUpsert: Word) => {
    setWordBank(prevBank => {
      const bankMap = new Map(prevBank.map(w => [w.id, w]));
      bankMap.set(wordToUpsert.id, wordToUpsert);
      return Array.from(bankMap.values());
    });
  }, [setWordBank]);

  const updateRevisionStats = useCallback((stats: Omit<RevisionStat, 'endCEFRLevel'>) => {
    const newStats = { ...stats, endCEFRLevel: currentCefrLevel };
    setRevisionStats(newStats);
  }, [currentCefrLevel, setRevisionStats]);

  return (
    <AppContext.Provider
      value={{
        userId,
        login,
        logout,
        apiKey,
        isSavingKey,
        saveApiKey,
        authError,
        setAuthError,
        language,
        setLanguage,
        currentCefrLevel,
        setCurrentCefrLevel,
        wordBank,
        upsertWordInBank,
        revisionStats,
        updateRevisionStats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
