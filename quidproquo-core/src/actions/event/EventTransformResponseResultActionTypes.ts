import { Action, ActionProcessor, ActionRequester, EitherActionResult } from '../../types/Action';
import { EventActionType } from './EventActionType';

// Payload
export interface EventTransformResponseResultActionPayload<EventParams extends Array<unknown>, QpqEventRecordResponse> {
  qpqEventRecordResponses: EitherActionResult<QpqEventRecordResponse>[];
  eventParams: EventParams;
}

// Action.
export interface EventTransformResponseResultAction<EventParams extends Array<unknown>, QpqEventRecordResponse>
  extends Action<EventTransformResponseResultActionPayload<EventParams, QpqEventRecordResponse>> {
  type: EventActionType.TransformResponseResult;
  payload: EventTransformResponseResultActionPayload<EventParams, QpqEventRecordResponse>;
}

// Functions
export type EventTransformResponseResultActionProcessor<EventParams extends Array<unknown>, QpqEventRecordResponse, EventResponse> = ActionProcessor<
  EventTransformResponseResultAction<EventParams, QpqEventRecordResponse>,
  EventResponse
>;
export type EventTransformResponseResultActionRequester<EventParams extends Array<unknown>, QpqEventRecordResponse, EventResponse> = ActionRequester<
  EventTransformResponseResultAction<EventParams, QpqEventRecordResponse>,
  EventResponse
>;
