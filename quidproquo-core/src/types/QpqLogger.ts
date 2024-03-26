import { StoryResult } from './StorySession';

export type QpqLogger = {
  log: (res: StoryResult<any>) => Promise<void>;
  waitToFinishWriting: () => Promise<void>;
  moveToPermanentStorage: () => Promise<void>;
};
