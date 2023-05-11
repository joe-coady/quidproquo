import { useState, useEffect } from 'react';
import { usePlatformApiGet } from '../../../view';

export const useDataFromPath = <T>(path: string): T | null => {
  const [data, setData] = useState<T | null>(null);
  const loadData = usePlatformApiGet<T>(path);

  useEffect(() => {
    loadData().then((newData) => {
      setData(newData);
    });
  }, [path, loadData]);

  return data;
};
