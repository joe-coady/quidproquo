import { Action } from '../../types/Action';
import { EventActionType } from './EventActionType';

// Payload
export interface EventTransformEventRecordActionPayload<EventRecord> {
  eventRecord: EventRecord;
}

export interface EventTransformEventRecordAction<EventRecord> extends Action<EventTransformEventRecordActionPayload<EventRecord>> {
  type: EventActionType.TransformEventRecord;
  payload: EventTransformEventRecordActionPayload<EventRecord>;
}

// Functions
