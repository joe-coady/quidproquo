import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { EventActionType, AnyMatchStoryResult } from './EventActionType';

// payload
export interface EventAutoRespondActionPayload<T, MSR extends AnyMatchStoryResult> {
  transformedEventParams: T;
  matchResult: MSR;
}

// action
export interface EventAutoRespondAction<T, MSR extends AnyMatchStoryResult>
  extends Action<EventAutoRespondActionPayload<T, MSR>> {
  type: EventActionType.AutoRespond;
  payload: EventAutoRespondActionPayload<T, MSR>;
}

// Functions  - // TODO: Remove anys here
export type EventAutoRespondActionProcessor<T, MSR extends AnyMatchStoryResult> = ActionProcessor<
  EventAutoRespondAction<T, MSR>,
  any
>;
export type EventAutoRespondActionRequester<T, MSR extends AnyMatchStoryResult> = ActionRequester<
  EventAutoRespondAction<T, MSR>,
  any
>;
