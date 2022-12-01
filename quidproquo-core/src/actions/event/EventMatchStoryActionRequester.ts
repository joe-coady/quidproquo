import { EventActionType } from './EventActionType';

import { EventMatchStoryActionRequester } from './EventMatchStoryActionTypes';
export function* askEventMatchStory<T>(
  transformedEventParams: any,
): EventMatchStoryActionRequester<T> {
  return yield {
    type: EventActionType.MatchStory,
    payload: { transformedEventParams },
  };
}
