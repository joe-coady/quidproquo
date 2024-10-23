import { EventActionType } from './EventActionType';
import { EventGetRecordsActionRequester } from './EventGetRecordsActionTypes';

export function* askEventGetRecords<EventParams extends Array<unknown>, QpqEventRecord>(
  ...eventParams: EventParams
): EventGetRecordsActionRequester<EventParams, QpqEventRecord> {
  return yield {
    type: EventActionType.GetRecords,
    payload: { eventParams },
  };
}
