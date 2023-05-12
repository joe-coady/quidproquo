import { StoryResult } from 'quidproquo-core';

export const serviceFunctionExeGenericTextExtractor = (storyResult: StoryResult<any>): string => {
  if (storyResult.runtimeType === 'SERVICE_FUNCTION_EXE') {
    return storyResult.input[0]?.functionName || '';
  }

  return '';
};
