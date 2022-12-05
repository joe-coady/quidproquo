import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { EventActionType } from './EventActionType';

// Custom return result
export type MatchStoryResult = {
  src?: string;
  runtime?: string;
  errorResourceNotFound?: string;
  options?: { [key: string]: string };
};

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
export type EventMatchStoryActionProcessor<T> = ActionProcessor<
  EventMatchStoryAction<T>,
  MatchStoryResult
>;
export type EventMatchStoryActionRequester<T> = ActionRequester<
  EventMatchStoryAction<T>,
  MatchStoryResult
>;
