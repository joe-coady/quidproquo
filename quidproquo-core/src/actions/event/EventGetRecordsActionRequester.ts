import { EventGetRecordsActionRequester } from './EventGetRecordsActionTypes';
import { EventActionType } from './EventActionType';

export function* askEventGetRecords<EventParams extends Array<unknown>, QpqEventRecord>(
  ...eventParams: EventParams
): EventGetRecordsActionRequester<EventParams, QpqEventRecord> {
  return yield {
    type: EventActionType.GetRecords,
    payload: { eventParams },
  };
}
