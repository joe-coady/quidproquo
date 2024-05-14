import { useState, useEffect, useRef } from 'react';

export function useRunEvery<T>(func: () => T, interval: number): T {
  const [value, setValue] = useState<T>(func);
  const intervalRef = useRef<NodeJS.Timer | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const newValue = func();
      setValue(newValue);
    }, interval * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [interval]);

  return value;
}
