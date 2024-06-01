import { EitherActionResult } from '../../types';
import { EventActionType } from './EventActionType';
import { EventTransformResponseResultActionRequester } from './EventTransformResponseResultActionTypes';

export function* askEventTransformResponseResult<EventParams extends Array<unknown>, QpqEventRecordResponse, EventResponse>(
  qpqEventRecordResponses: EitherActionResult<QpqEventRecordResponse>[],
  ...eventParams: EventParams
): EventTransformResponseResultActionRequester<EventParams, QpqEventRecordResponse, EventResponse> {
  return yield {
    type: EventActionType.TransformResponseResult,
    payload: { qpqEventRecordResponses, eventParams },
  };
}
