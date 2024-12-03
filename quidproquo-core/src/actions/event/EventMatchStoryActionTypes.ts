import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { AnyMatchStoryResult, EventActionType } from './EventActionType';

// Payload
export interface EventMatchStoryActionPayload<QpqEventRecord, EventParams extends Array<unknown>> {
  qpqEventRecord: QpqEventRecord;
  eventParams: EventParams;
}

// Action
export interface EventMatchStoryAction<QpqEventRecord, EventParams extends Array<unknown>>
  extends Action<EventMatchStoryActionPayload<QpqEventRecord, EventParams>> {
  type: EventActionType.MatchStory;
  payload: EventMatchStoryActionPayload<QpqEventRecord, EventParams>;
}

// Functions
export type EventMatchStoryActionProcessor<QpqEventRecord, MSR extends AnyMatchStoryResult, EventParams extends Array<unknown>> = ActionProcessor<
  EventMatchStoryAction<QpqEventRecord, EventParams>,
  MSR
>;
export type EventMatchStoryActionRequester<QpqEventRecord, MSR extends AnyMatchStoryResult, EventParams extends Array<unknown>> = ActionRequester<
  EventMatchStoryAction<QpqEventRecord, EventParams>,
  MSR
>;
