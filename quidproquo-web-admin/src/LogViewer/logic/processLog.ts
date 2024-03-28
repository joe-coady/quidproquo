import { ActionHistory, StoryResult } from 'quidproquo-core';

export const processLog = (logFile: StoryResult<any>): ActionHistory[] => {
  if (!logFile) {
    return [];
  }

  return logFile.history;
};
