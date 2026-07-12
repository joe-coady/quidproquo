import { EventActionType } from './EventActionType';
import { EventTransformEventRecordResponseActionRequester } from './EventTransformEventRecordResponseActionTypes';

export function* askEventTransformEventRecordResponse<EventRecord, QpqEventRecord>(
  eventRecord: EventRecord,
): EventTransformEventRecordResponseActionRequester<EventRecord, QpqEventRecord> {
  return yield {
    type: EventActionType.TransformEventRecordResponse,
    payload: { eventRecord },
  };
}
