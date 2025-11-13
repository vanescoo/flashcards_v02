
import { useState, useEffect } from 'react';

function getValue<T>(key: string, initialValue: T | (() => T)): T {
  const savedValue = localStorage.getItem(key);
  if (savedValue) {
    try {
      return JSON.parse(savedValue);
    } catch (error) {
      console.error('Error parsing JSON from localStorage', error);
      localStorage.removeItem(key);
    }
  }

  return initialValue instanceof Function ? initialValue() : initialValue;
}

export function useLocalStorage<T>(key: string | null, initialValue: T | (() => T)): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    if (!key) {
      return initialValue instanceof Function ? initialValue() : initialValue;
    }
    return getValue(key, initialValue);
  });

  // When key changes (e.g., user logs in/out), re-initialize state from localStorage
  useEffect(() => {
    if (key) {
      setValue(getValue(key, initialValue));
    } else {
      // When logging out (key becomes null), reset to initial value
      setValue(initialValue instanceof Function ? initialValue() : initialValue);
    }
    // We only want this to run when the key changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (key) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }, [key, value]);

  return [value, setValue];
}
