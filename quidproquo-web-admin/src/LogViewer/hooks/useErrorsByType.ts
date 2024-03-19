import { useMemo } from 'react';
import { StoryResultMetadataLog } from '../../types';

export const useErrorsByType = (logs: StoryResultMetadataLog[]) => {
  const data = useMemo(() => {
    const errorCounts: Record<string, { count: number; errorText: string }> = {};

    logs.forEach((log) => {
      if (log.error) {
        const errorText = log.error || '';
        const truncatedErrorText =
          errorText.length > 50 ? errorText.slice(0, 50) + '...' : errorText;

        errorCounts[truncatedErrorText] = errorCounts[truncatedErrorText] || {
          count: 0,
          errorText: truncatedErrorText,
        };

        errorCounts[truncatedErrorText].count++;
      }
    });

    return Object.values(errorCounts).sort((a, b) => b.count - a.count);
  }, [logs]);

  console.log(data);

  return data;
};
