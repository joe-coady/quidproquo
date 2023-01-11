import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { EventActionType } from './EventActionType';

// Payload
export interface EventTransformResponseResultActionPayload<R, T> {
  response: R;
  transformedEventParams: T;
}

// Action
export interface EventTransformResponseResultAction<R, T>
  extends Action<EventTransformResponseResultActionPayload<R, T>> {
  type: EventActionType.TransformResponseResult;
  payload: EventTransformResponseResultActionPayload<R, T>;
}

// Functions
export type EventTransformResponseResultActionProcessor<R, T, TRes> = ActionProcessor<
  EventTransformResponseResultAction<R, T>,
  TRes
>;
export type EventTransformResponseResultActionRequester<R, T, TRes> = ActionRequester<
  EventTransformResponseResultAction<R, T>,
  TRes
>;
