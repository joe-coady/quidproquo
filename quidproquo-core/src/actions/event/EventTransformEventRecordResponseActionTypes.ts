import { Action } from '../../types/Action';
import { EventActionType } from './EventActionType';

// Payload
export interface EventTransformEventRecordResponseActionPayload<EventRecord> {
  eventRecord: EventRecord;
}

export interface EventTransformEventRecordResponseAction<EventRecord> extends Action<EventTransformEventRecordResponseActionPayload<EventRecord>> {
  type: EventActionType.TransformEventRecordResponse;
  payload: EventTransformEventRecordResponseActionPayload<EventRecord>;
}

// Functions
