import { EventAutoRespondActionRequester } from './EventAutoRespondActionTypes';
import { EventActionType, AnyMatchStoryResult } from './EventActionType';

export function* askEventAutoRespond<T, MSR extends AnyMatchStoryResult, TRes>(
  transformedEventParams: T,
  matchResult: MSR,
): EventAutoRespondActionRequester<T, MSR, TRes> {
  return yield {
    type: EventActionType.AutoRespond,
    payload: { transformedEventParams, matchResult },
  };
}
