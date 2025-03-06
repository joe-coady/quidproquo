import { SystemActionType } from 'quidproquo-core';

const coreSystemActionComponentMap: Record<string, string[]> = {
  [SystemActionType.Batch]: ['askBatch', 'actions'],
  [SystemActionType.ExecuteStory]: ['askExecuteStory', 'runtime', 'params', 'storySession'],
};

export default coreSystemActionComponentMap;
