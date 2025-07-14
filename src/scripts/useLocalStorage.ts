import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T | (() => T)) {
  const isClient = typeof window !== 'undefined';

  const [value, setValue] = useState<T>(() => {
    if (!isClient) return initialValue;
    
    try {
      const jsonValue = window.localStorage.getItem(key);
      if (jsonValue != null) {
        // 因為 Set 無法直接 JSON.parse，需要特殊處理
        const parsed = JSON.parse(jsonValue);
        if (Array.isArray(parsed)) {
          return new Set(parsed) as T;
        }
        return parsed;
      }

      if (typeof initialValue === 'function') {
        return (initialValue as () => T)();
      } else {
        return initialValue;
      }
    } catch (error) {
      console.error(`Error reading localStorage key “${key}”:`, error);
      return typeof initialValue === 'function'
        ? (initialValue as () => T)()
        : initialValue;
    }
  });

  useEffect(() => {
    try {
      // Set 需要轉換為 Array 才能儲存
      const valueToStore = value instanceof Set ? Array.from(value) : value;
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key “${key}”:`, error);
    }
  }, [key, value]);

  return [value, setValue] as const;
}