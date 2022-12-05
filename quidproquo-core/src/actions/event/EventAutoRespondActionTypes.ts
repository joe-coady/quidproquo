import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { EventActionType } from './EventActionType';

// payload
export interface EventAutoRespondActionPayload<T> {
  transformedEventParams: T;
}

// action
export interface EventAutoRespondAction<T> extends Action<EventAutoRespondActionPayload<T>> {
  type: EventActionType.AutoRespond;
  payload: EventAutoRespondActionPayload<T>;
}

// Functions
export type EventAutoRespondActionProcessor<T> = ActionProcessor<EventAutoRespondAction<T>, any>;
export type EventAutoRespondActionRequester<T> = ActionRequester<EventAutoRespondAction<T>, any>;
