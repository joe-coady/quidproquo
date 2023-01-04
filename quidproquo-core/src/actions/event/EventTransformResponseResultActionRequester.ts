import { EventActionType } from './EventActionType';
import { EventTransformResponseResultActionRequester } from './EventTransformResponseResultActionTypes';

export function* askEventTransformResponseResult<TOutputRes, TInputRes, TTransformedEventParams>(
  response: TInputRes,
  transformedEventParams: TTransformedEventParams,
): EventTransformResponseResultActionRequester<TOutputRes> {
  return yield {
    type: EventActionType.TransformResponseResult,
    payload: { response, transformedEventParams },
  };
}
