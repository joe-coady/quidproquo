import { StoryResult } from './StorySession';

export type QpqLogger = {
  enableLogs: (enable: boolean, reason: string, correlation: string) => Promise<void>;
  log: (res: StoryResult<any>) => Promise<void>;
  waitToFinishWriting: () => Promise<void>;
  moveToPermanentStorage: () => Promise<void>;
};
