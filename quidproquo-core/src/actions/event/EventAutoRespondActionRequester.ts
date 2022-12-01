import { EventAutoRespondActionRequester } from './EventAutoRespondActionTypes';
import { EventActionType } from './EventActionType';

export function* askEventAutoRespond<T>(
  transformedEventParams: any,
): EventAutoRespondActionRequester<T> {
  return yield {
    type: EventActionType.AutoRespond,
    payload: { transformedEventParams },
  };
}
