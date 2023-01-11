import { EventActionType } from './EventActionType';
import { EventTransformResponseResultActionRequester } from './EventTransformResponseResultActionTypes';

export function* askEventTransformResponseResult<TOutputRes, TInputRes, TTransformedEventParams>(
  response: TInputRes,
  transformedEventParams: TTransformedEventParams,
): EventTransformResponseResultActionRequester<TInputRes, TTransformedEventParams, TOutputRes> {
  return yield {
    type: EventActionType.TransformResponseResult,
    payload: { response, transformedEventParams },
  };
}
