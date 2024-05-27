import { EventTransformEventRecordActionRequester } from './EventTransformEventRecordActionTypes';
import { EventActionType } from './EventActionType';

export function* askEventTransformEventRecord<EventRecord, QpqEventRecord>(
  eventRecord: EventRecord,
): EventTransformEventRecordActionRequester<EventRecord, QpqEventRecord> {
  return yield {
    type: EventActionType.TransformEventRecord,
    payload: { eventRecord },
  };
}
