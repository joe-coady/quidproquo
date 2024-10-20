import { StorySession } from '../../types';
import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { AnyMatchStoryResult, EventActionType } from './EventActionType';

// Payload
export interface EventGetStorySessionActionPayload<EventParams extends Array<unknown>, QpqEventRecord, MSR extends AnyMatchStoryResult> {
  qpqEventRecord: QpqEventRecord;
  eventParams: EventParams;
  matchStoryResult: MSR;
}

// Action
export interface EventGetStorySessionAction<EventParams extends Array<unknown>, QpqEventRecord, MSR extends AnyMatchStoryResult>
  extends Action<EventGetStorySessionActionPayload<EventParams, QpqEventRecord, MSR>> {
  type: EventActionType.GetStorySession;
  payload: EventGetStorySessionActionPayload<EventParams, QpqEventRecord, MSR>;
}

// Functions
export type EventGetStorySessionActionProcessor<
  EventParams extends Array<unknown>,
  QpqEventRecord,
  MSR extends AnyMatchStoryResult,
> = ActionProcessor<EventGetStorySessionAction<EventParams, QpqEventRecord, MSR>, StorySession | undefined>;
export type EventGetStorySessionActionRequester<
  EventParams extends Array<unknown>,
  QpqEventRecord,
  MSR extends AnyMatchStoryResult,
> = ActionRequester<EventGetStorySessionAction<EventParams, QpqEventRecord, MSR>, StorySession | undefined>;
