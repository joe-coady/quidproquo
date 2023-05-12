import { StoryResult } from 'quidproquo-core';

export const queueEventGenericTextExtractor = (storyResult: StoryResult<any>): string => {
  if (storyResult.runtimeType === 'QUEUE_EVENT') {
    return storyResult.input[0]?.type || '';
  }

  return '';
};
