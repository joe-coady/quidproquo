import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { EventActionType, AnyMatchStoryResult } from './EventActionType';

// Payload
export interface EventMatchStoryActionPayload<QpqEventRecord> {
  qpqEventRecord: QpqEventRecord;
}

// Action
export interface EventMatchStoryAction<QpqEventRecord> extends Action<EventMatchStoryActionPayload<QpqEventRecord>> {
  type: EventActionType.MatchStory;
  payload: EventMatchStoryActionPayload<QpqEventRecord>;
}

// Functions
export type EventMatchStoryActionProcessor<QpqEventRecord, MSR extends AnyMatchStoryResult> = ActionProcessor<
  EventMatchStoryAction<QpqEventRecord>,
  MSR
>;
export type EventMatchStoryActionRequester<QpqEventRecord, MSR extends AnyMatchStoryResult> = ActionRequester<
  EventMatchStoryAction<QpqEventRecord>,
  MSR
>;
