import { getUniqueKeyFromQpqFunctionRuntime, StoryResult } from 'quidproquo-core';

export const unknownGenericTextExtractor = (storyResult: StoryResult<any>): string[] => {
  if (storyResult.qpqFunctionRuntimeInfo) {
    return [getUniqueKeyFromQpqFunctionRuntime(storyResult.qpqFunctionRuntimeInfo)];
  }

  return [''];
};
