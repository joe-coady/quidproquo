import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { EventActionType } from './EventActionType';

// Payload
export interface EventTransformEventRecordActionPayload<EventRecord> {
  eventRecord: EventRecord;
}

// Action
export interface EventTransformEventRecordAction<EventRecord> extends Action<EventTransformEventRecordActionPayload<EventRecord>> {
  type: EventActionType.TransformEventRecord;
  payload: EventTransformEventRecordActionPayload<EventRecord>;
}

// Functions
export type EventTransformEventRecordActionProcessor<EventRecord, QpqEventRecord> = ActionProcessor<
  EventTransformEventRecordAction<EventRecord>,
  QpqEventRecord
>;
export type EventTransformEventRecordActionRequester<EventRecord, QpqEventRecord> = ActionRequester<
  EventTransformEventRecordAction<EventRecord>,
  QpqEventRecord
>;
