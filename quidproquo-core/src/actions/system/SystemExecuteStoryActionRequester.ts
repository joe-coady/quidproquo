import { SystemActionType } from './SystemActionType';
import { SystemExecuteStoryActionRequester } from './SystemExecuteStoryActionTypes';

export function* askExecuteStory<T extends Array<any>>(
  type: string,
  src: string,
  runtime: string,
  params: T,
): SystemExecuteStoryActionRequester<T> {
  return yield {
    type: SystemActionType.ExecuteStory,
    payload: {
      type,
      src,
      runtime,
      params,
    },
  };
}
