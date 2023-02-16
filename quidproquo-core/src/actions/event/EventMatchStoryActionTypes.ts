import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { EventActionType, MatchStoryResult } from './EventActionType';

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
export type EventMatchStoryActionProcessor<T, MatchOptions, Config> = ActionProcessor<
  EventMatchStoryAction<T>,
  MatchStoryResult<MatchOptions, Config>
>;
export type EventMatchStoryActionRequester<T, MatchOptions, Config> = ActionRequester<
  EventMatchStoryAction<T>,
  MatchStoryResult<MatchOptions, Config>
>;
