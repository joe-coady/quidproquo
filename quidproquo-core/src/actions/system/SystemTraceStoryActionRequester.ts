import { QpqExecutionTrace, StoryResult } from '../../types';
import { SystemActionType } from './SystemActionType';
import { SystemTraceStoryActionRequester } from './SystemTraceStoryActionTypes';

export function* askTraceStory(storyResult: StoryResult<any>, scriptPatterns?: string[], onlyOwnCode?: boolean): SystemTraceStoryActionRequester {
  return (yield {
    type: SystemActionType.TraceStory,
    payload: {
      storyResult,
      scriptPatterns,
      onlyOwnCode,
    },
  }) as QpqExecutionTrace;
}
