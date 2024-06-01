import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { EventActionType } from './EventActionType';

// Payload
export interface EventTransformEventRecordResponseActionPayload<EventRecord> {
  eventRecord: EventRecord;
}

// Action
export interface EventTransformEventRecordResponseAction<EventRecord> extends Action<EventTransformEventRecordResponseActionPayload<EventRecord>> {
  type: EventActionType.TransformEventRecordResponse;
  payload: EventTransformEventRecordResponseActionPayload<EventRecord>;
}

// Functions
export type EventTransformEventRecordResponseActionProcessor<EventRecord, QpqEventRecord> = ActionProcessor<
  EventTransformEventRecordResponseAction<EventRecord>,
  QpqEventRecord
>;
export type EventTransformEventRecordResponseActionRequester<EventRecord, QpqEventRecord> = ActionRequester<
  EventTransformEventRecordResponseAction<EventRecord>,
  QpqEventRecord
>;
