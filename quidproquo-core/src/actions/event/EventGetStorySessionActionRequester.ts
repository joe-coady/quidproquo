import { EventGetStorySessionActionRequester } from './EventGetStorySessionActionTypes';
import { AnyMatchStoryResult, EventActionType } from './EventActionType';

export function* askEventGetStorySession<EventParams extends Array<unknown>, QpqEventRecord, MSR extends AnyMatchStoryResult>(
  eventParams: EventParams,
  qpqEventRecord: QpqEventRecord,
  matchStoryResult: MSR,
): EventGetStorySessionActionRequester<EventParams, QpqEventRecord, MSR> {
  return yield {
    type: EventActionType.GetStorySession,
    payload: { eventParams, qpqEventRecord, matchStoryResult },
  };
}
