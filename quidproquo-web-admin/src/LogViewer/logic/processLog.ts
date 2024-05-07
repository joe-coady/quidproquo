import { ActionHistory, StoryResult } from 'quidproquo';

export const processLog = (logFile: StoryResult<any>): ActionHistory[] => {
  if (!logFile) {
    return [];
  }

  return logFile.history.filter((item) => item.act.type !== '@quidproquo-core/Context/List');
};
