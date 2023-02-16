import { EventMatchStoryActionRequester } from './EventMatchStoryActionTypes';
import { EventActionType, AnyMatchStoryResult } from './EventActionType';

export function* askEventMatchStory<T, MSR extends AnyMatchStoryResult>(
  transformedEventParams: T,
): EventMatchStoryActionRequester<T, MSR> {
  return yield {
    type: EventActionType.MatchStory,
    payload: { transformedEventParams },
  };
}
