import { EventActionType } from './EventActionType';

import { EventTransformEventParamsActionRequester } from './EventTransformEventParamsActionTypes';

export function* askEventTransformEventParams<T extends Array<unknown>, TRes>(
  ...eventParams: T
): EventTransformEventParamsActionRequester<T, TRes> {
  return yield {
    type: EventActionType.TransformEventParams,
    payload: { eventParams },
  };
}
