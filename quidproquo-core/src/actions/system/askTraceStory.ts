import { QpqExecutionTrace, StoryResult } from '../../types';
import { createActionRequester } from '../../types/utils/createActionRequester';
import { SystemActionType } from './SystemActionType';

export const askTraceStory = createActionRequester<QpqExecutionTrace>()({
  actionType: SystemActionType.TraceStory,
  getPayload: (storyResult: StoryResult<any>, scriptPatterns?: string[], onlyOwnCode?: boolean) => ({ storyResult, scriptPatterns, onlyOwnCode }),
});
