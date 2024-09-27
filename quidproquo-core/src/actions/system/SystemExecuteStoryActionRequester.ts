import { QpqFunctionRuntime, StorySession } from '../../types';
import { SystemActionType } from './SystemActionType';
import { SystemExecuteStoryActionRequester } from './SystemExecuteStoryActionTypes';

export function* askExecuteStory<StoryInput extends Array<any>, StoryOutput>(
  runtime: QpqFunctionRuntime,
  params: StoryInput,
  storySession?: StorySession,
): SystemExecuteStoryActionRequester<StoryInput, StoryOutput> {
  return yield {
    type: SystemActionType.ExecuteStory,
    payload: {
      runtime,
      params,
      storySession,
    },
  };
}
