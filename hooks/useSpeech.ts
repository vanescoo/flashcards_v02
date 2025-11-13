
import { useCallback, useEffect, useState } from 'react';
import { Language } from '../types.ts';

const languageToLocale: Record<Language, string> = {
    Dutch: 'nl-NL',
    Italian: 'it-IT',
    French: 'fr-FR',
    Spanish: 'es-ES',
    German: 'de-DE',
};

export function useSpeech() {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
  }, []);

  const speak = useCallback((text: string, language: Language) => {
    if (!isSupported) {
      console.warn('Speech synthesis is not supported in this browser.');
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = languageToLocale[language] || 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.cancel(); // Cancel any previous speech
    window.speechSynthesis.speak(utterance);
  }, [isSupported]);

  return { speak, isSupported };
}
