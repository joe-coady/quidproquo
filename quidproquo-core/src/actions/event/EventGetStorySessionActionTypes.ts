import { StorySession } from '../../types';
import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { EventActionType } from './EventActionType';

// Payload
export interface EventGetStorySessionActionPayload<EventParams extends Array<unknown>, QpqEventRecord> {
  record: QpqEventRecord;
  eventParams: EventParams;
}

// Action
export interface EventGetStorySessionAction<EventParams extends Array<unknown>, QpqEventRecord>
  extends Action<EventGetStorySessionActionPayload<EventParams, QpqEventRecord>> {
  type: EventActionType.GetStorySession;
  payload: EventGetStorySessionActionPayload<EventParams, QpqEventRecord>;
}

// Functions
export type EventGetStorySessionActionProcessor<EventParams extends Array<unknown>, QpqEventRecord> = ActionProcessor<
  EventGetStorySessionAction<EventParams, QpqEventRecord>,
  StorySession | undefined
>;
export type EventGetStorySessionActionRequester<EventParams extends Array<unknown>, QpqEventRecord> = ActionRequester<
  EventGetStorySessionAction<EventParams, QpqEventRecord>,
  StorySession | undefined
>;
