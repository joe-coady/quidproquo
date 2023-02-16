import { EventActionType } from './EventActionType';

import { EventMatchStoryActionRequester } from './EventMatchStoryActionTypes';
export function* askEventMatchStory<T, MatchOptions>(
  transformedEventParams: any,
): EventMatchStoryActionRequester<T, MatchOptions> {
  return yield {
    type: EventActionType.MatchStory,
    payload: { transformedEventParams },
  };
}
