import { EventAutoRespondActionRequester } from './EventAutoRespondActionTypes';
import { EventActionType, MatchStoryResult } from './EventActionType';

export function* askEventAutoRespond<T, MatchOptions, Config>(
  transformedEventParams: any,
  matchResult: MatchStoryResult<MatchOptions, Config>,
): EventAutoRespondActionRequester<T, MatchOptions, Config> {
  return yield {
    type: EventActionType.AutoRespond,
    payload: { transformedEventParams, matchResult },
  };
}
