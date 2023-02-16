import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { EventActionType, AnyMatchStoryResult } from './EventActionType';

// Payload
export interface EventMatchStoryActionPayload<T> {
  transformedEventParams: T;
}

// Action
export interface EventMatchStoryAction<T> extends Action<EventMatchStoryActionPayload<T>> {
  type: EventActionType.MatchStory;
  payload: EventMatchStoryActionPayload<T>;
}

// Functions
export type EventMatchStoryActionProcessor<T, MSR extends AnyMatchStoryResult> = ActionProcessor<
  EventMatchStoryAction<T>,
  MSR
>;
export type EventMatchStoryActionRequester<T, MSR extends AnyMatchStoryResult> = ActionRequester<
  EventMatchStoryAction<T>,
  MSR
>;
