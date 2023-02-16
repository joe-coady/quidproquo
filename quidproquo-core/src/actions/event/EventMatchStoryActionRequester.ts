import { EventActionType } from './EventActionType';

import { EventMatchStoryActionRequester } from './EventMatchStoryActionTypes';
export function* askEventMatchStory<T, MatchOptions, Config>(
  transformedEventParams: any,
): EventMatchStoryActionRequester<T, MatchOptions, Config> {
  return yield {
    type: EventActionType.MatchStory,
    payload: { transformedEventParams },
  };
}
