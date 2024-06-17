import { useState, useEffect, useRef } from 'react';

export function useRunEvery<T>(func: () => T, interval: number): T {
  const [value, setValue] = useState<T>(func);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      const newValue = func();
      setValue(newValue);
    }, interval * 1000);

    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [interval]);

  return value;
}
