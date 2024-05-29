import { EventGetStorySessionActionRequester } from './EventGetStorySessionActionTypes';
import { EventActionType } from './EventActionType';

export function* askEventGetStorySession<EventParams extends Array<unknown>, QpqEventRecord>(
  eventParams: EventParams,
  record: QpqEventRecord,
): EventGetStorySessionActionRequester<EventParams, QpqEventRecord> {
  return yield {
    type: EventActionType.GetStorySession,
    payload: { eventParams, record },
  };
}
