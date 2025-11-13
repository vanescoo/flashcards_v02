
import { useState, useCallback, useContext } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { AppContext } from '../context/AppContext.tsx';
import { Language, CEFRLevel } from '../types.ts';

interface WordResponse {
  word: string;
  translation: string;
  exampleSentence: string;
}

export function useGemini() {
  const { apiKey } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateWord = useCallback(async (language: Language, cefrLevel: CEFRLevel, wordsToExclude: string[]): Promise<WordResponse | null> => {
    if (!apiKey) {
      setError('API key is not set. Please provide it in the login modal.');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey, vertexai: true });
      
      const schema = {
        type: Type.OBJECT,
        properties: {
          word: {
            type: Type.STRING,
            description: `A single ${language} word appropriate for the ${cefrLevel} CEFR level.`,
          },
          translation: {
            type: Type.STRING,
            description: 'A concise English translation of the word.',
          },
          exampleSentence: {
            type: Type.STRING,
            description: `A simple example sentence in ${language} using the word.`,
          },
        },
        required: ['word', 'translation', 'exampleSentence'],
      };

      const exclusionPrompt = wordsToExclude.length > 0 ? `Do not generate any of the following words: ${wordsToExclude.join(', ')}.` : '';

      const prompt = `You are an expert linguist. Generate a single vocabulary word for a language learner.
Language: ${language}
CEFR Level: ${cefrLevel}
${exclusionPrompt}
Provide the word, its English translation, and a simple example sentence in ${language} using the word. Avoid common or overly simple words unless the level is A1.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { role: 'user', parts: [{ text: prompt }] },
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
          temperature: 1.2, // Increase creativity to get more diverse words
        },
      });

      const jsonText = response.text.trim();
      const data: WordResponse = JSON.parse(jsonText);
      
      if (data.word && data.translation && data.exampleSentence) {
        return data;
      } else {
        throw new Error('Invalid data structure in response.');
      }
    } catch (err) {
      console.error('Gemini API error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during word generation.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [apiKey]);

  return { generateWord, isLoading, error };
}
