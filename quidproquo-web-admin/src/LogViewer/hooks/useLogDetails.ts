import { useState, useMemo } from 'react';
import { StoryResult } from 'quidproquo';
import { processLog } from '../logic';

export const useLogDetails = (log: StoryResult<any>) => {
  const events = useMemo(() => {
    if (log) {
      return processLog(log);
    } else {
      return [];
    }
  }, [log]);

  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});

  const toggleEventExpanded = (key: string) => {
    setExpandedEvents((prevState) => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  };

  return { events, expandedEvents, toggleEventExpanded };
};
