import { useState, useEffect, useRef } from 'react';
import { usePlatformApiGet } from '../../../view';

export const useDataFromPath = <T>(path: string): T | null => {
  const [data, setData] = useState<T | null>(null);
  const loadData = usePlatformApiGet<T>(path);
  const cache = useRef<Record<string, T>>({});

  useEffect(() => {
    if (cache.current[path]) {
      setData(cache.current[path]);
      return;
    }

    var allowDataSet = true;
    loadData().then((newData) => {
      if (allowDataSet) {
        setData(newData);
      }

      cache.current[path] = newData;
    });

    return () => {
      allowDataSet = false;
    };
  }, [path, loadData]);

  return data;
};
