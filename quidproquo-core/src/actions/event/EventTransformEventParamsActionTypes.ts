import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { EventActionType } from './EventActionType';

// Payload
export interface EventTransformEventParamsActionPayload<T extends Array<unknown>> {
  eventParams: T;
}

// Action
export interface EventTransformEventParamsAction<T extends Array<unknown>> extends Action<EventTransformEventParamsActionPayload<T>> {
  type: EventActionType.TransformEventParams;
  payload: EventTransformEventParamsActionPayload<T>;
}

// Functions
export type EventTransformEventParamsActionProcessor<T extends Array<unknown>, TRes> = ActionProcessor<EventTransformEventParamsAction<T>, TRes>;
export type EventTransformEventParamsActionRequester<T extends Array<unknown>, TRes> = ActionRequester<EventTransformEventParamsAction<T>, TRes>;
