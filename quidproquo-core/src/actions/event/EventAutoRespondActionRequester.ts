import { EventAutoRespondActionRequester } from './EventAutoRespondActionTypes';
import { EventActionType, AnyMatchStoryResult } from './EventActionType';

export function* askEventAutoRespond<QpqEventRecord, MSR extends AnyMatchStoryResult, QpqEventRecordResponse>(
  qpqEventRecord: QpqEventRecord,
  matchResult: MSR,
): EventAutoRespondActionRequester<QpqEventRecord, MSR, QpqEventRecordResponse> {
  return yield {
    type: EventActionType.AutoRespond,
    payload: { qpqEventRecord, matchResult },
  };
}
