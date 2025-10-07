/**
 * Generic localStorage hook with TypeScript and cross-tab synchronization.
 *
 * Features:
 * - Type-safe with TypeScript generics
 * - Automatic serialization/deserialization
 * - Cross-tab synchronization using storage events
 * - Error handling for quota exceeded and parse errors
 * - SSR-safe (checks for window availability)
 */

import { useState, useEffect, useCallback } from 'react';

type SetValue<T> = (value: T | ((prevValue: T) => T)) => void;

interface UseLocalStorageReturn<T> {
  value: T;
  setValue: SetValue<T>;
  removeValue: () => void;
}

/**
 * Custom hook for managing localStorage with automatic sync across tabs.
 *
 * @param key - The localStorage key
 * @param initialValue - Default value if key doesn't exist
 * @returns Tuple of [value, setValue, removeValue]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, SetValue<T>, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);

      if (item === null) {
        return initialValue;
      }

      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`[useLocalStorage] Error reading key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue: SetValue<T> = useCallback(
    (value) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        setStoredValue(valueToStore);

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          console.error(
            `[useLocalStorage] Storage quota exceeded for key "${key}"`
          );
        } else {
          console.error(`[useLocalStorage] Error setting key "${key}":`, error);
        }
      }
    },
    [key, storedValue]
  );

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);

      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`[useLocalStorage] Error removing key "${key}":`, error);
    }
  }, [key, initialValue]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = JSON.parse(e.newValue) as T;
          setStoredValue(newValue);
        } catch (error) {
          console.error(
            `[useLocalStorage] Error parsing storage event for key "${key}":`,
            error
          );
        }
      } else if (e.key === key && e.newValue === null) {
        setStoredValue(initialValue);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }

    return undefined;
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * Alternative hook that returns an object instead of array.
 * Useful when you prefer named properties.
 */
export function useLocalStorageObject<T>(
  key: string,
  initialValue: T
): UseLocalStorageReturn<T> {
  const [value, setValue, removeValue] = useLocalStorage(key, initialValue);

  return { value, setValue, removeValue };
}
