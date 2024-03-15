import { useState, useEffect, useRef } from 'react';
import { useExternalApiGet, usePlatformApiGet } from '../../../view';

export const useExternalData = <T>(url?: string): T | null => {
  const [data, setData] = useState<T | null>(null);
  const loadData = useExternalApiGet<T>(url);
  const cache = useRef<Record<string, T>>({});

  useEffect(() => {
    console.log('useExternalData', url);

    if (!url) {
      setData(null);
      return;
    }

    if (cache.current[url]) {
      setData(cache.current[url]);
      return;
    }

    var allowDataSet = true;
    loadData().then((newData) => {
      if (allowDataSet) {
        setData(newData);
      }

      cache.current[url] = newData;
    });

    return () => {
      allowDataSet = false;
    };
  }, [url, loadData]);

  console.log('data', data);

  return cache.current[url || ''];
};
