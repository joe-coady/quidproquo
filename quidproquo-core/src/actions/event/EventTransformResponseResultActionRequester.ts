import { EventActionType } from './EventActionType';
import { EventTransformResponseResultActionRequester } from './EventTransformResponseResultActionTypes';

export function* askEventTransformResponseResult<TOutputRes, TInputRes>(
  response: TInputRes,
): EventTransformResponseResultActionRequester<TOutputRes> {
  return yield {
    type: EventActionType.TransformResponseResult,
    payload: { response },
  };
}
