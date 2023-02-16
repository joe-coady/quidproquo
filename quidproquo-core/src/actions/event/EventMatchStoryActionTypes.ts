import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { EventActionType } from './EventActionType';

// Custom return result
export type MatchStoryResult<MatchOptions> = {
  src?: string;
  runtime?: string;
  options?: MatchOptions;
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
export type EventMatchStoryActionProcessor<T, MatchOptions> = ActionProcessor<
  EventMatchStoryAction<T>,
  MatchStoryResult<MatchOptions>
>;
export type EventMatchStoryActionRequester<T, MatchOptions> = ActionRequester<
  EventMatchStoryAction<T>,
  MatchStoryResult<MatchOptions>
>;
