import { SystemActionType } from './SystemActionType';
import { SystemExecuteStoryActionRequester } from './SystemExecuteStoryActionTypes';

export function* askExecuteStory<StoryInput extends Array<any>, StoryOutput>(
  src: string,
  runtime: string,
  params: StoryInput,
): SystemExecuteStoryActionRequester<StoryInput, StoryOutput> {
  return yield {
    type: SystemActionType.ExecuteStory,
    payload: {
      src,
      runtime,
      params,
    },
  };
}
