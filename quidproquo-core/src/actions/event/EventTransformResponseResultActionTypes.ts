import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { EventActionType } from './EventActionType';

// Payload
export interface EventTransformResponseResultActionPayload {
  response: any;
  transformedEventParams: any;
}

// Action
export interface EventTransformResponseResultAction
  extends Action<EventTransformResponseResultActionPayload> {
  type: EventActionType.TransformResponseResult;
  payload: EventTransformResponseResultActionPayload;
}

// Functions
export type EventTransformResponseResultActionProcessor<TRes> = ActionProcessor<
  EventTransformResponseResultAction,
  TRes
>;
export type EventTransformResponseResultActionRequester<TRes> = ActionRequester<
  EventTransformResponseResultAction,
  TRes
>;
