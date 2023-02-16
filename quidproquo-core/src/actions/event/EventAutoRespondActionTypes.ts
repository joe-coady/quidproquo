import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { EventActionType, MatchStoryResult } from './EventActionType';

// payload
export interface EventAutoRespondActionPayload<T, MatchOptions, Config> {
  transformedEventParams: T;
  matchResult: MatchStoryResult<MatchOptions, Config>;
}

// action
export interface EventAutoRespondAction<T, MatchOptions, Config>
  extends Action<EventAutoRespondActionPayload<T, MatchOptions, Config>> {
  type: EventActionType.AutoRespond;
  payload: EventAutoRespondActionPayload<T, MatchOptions, Config>;
}

// Functions
export type EventAutoRespondActionProcessor<T, MatchOptions, Config> = ActionProcessor<
  EventAutoRespondAction<T, MatchOptions, Config>,
  any
>;
export type EventAutoRespondActionRequester<T, MatchOptions, Config> = ActionRequester<
  EventAutoRespondAction<T, MatchOptions, Config>,
  any
>;
