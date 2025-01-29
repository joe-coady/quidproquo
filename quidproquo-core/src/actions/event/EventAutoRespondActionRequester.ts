import { AnyMatchStoryResult, EventActionType } from './EventActionType';
import { EventAutoRespondActionRequester } from './EventAutoRespondActionTypes';

export function* askEventAutoRespond<QpqEventRecord, MSR extends AnyMatchStoryResult, QpqEventRecordResponse>(
  qpqEventRecord: QpqEventRecord,
  matchResult: MSR,
): EventAutoRespondActionRequester<QpqEventRecord, MSR, QpqEventRecordResponse> {
  return yield {
    type: EventActionType.AutoRespond,
    payload: { qpqEventRecord, matchResult },
  };
}
