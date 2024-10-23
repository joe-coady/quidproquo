import { EventActionType } from './EventActionType';
import { EventTransformEventRecordActionRequester } from './EventTransformEventRecordActionTypes';

export function* askEventTransformEventRecord<EventRecord, QpqEventRecord>(
  eventRecord: EventRecord,
): EventTransformEventRecordActionRequester<EventRecord, QpqEventRecord> {
  return yield {
    type: EventActionType.TransformEventRecord,
    payload: { eventRecord },
  };
}
