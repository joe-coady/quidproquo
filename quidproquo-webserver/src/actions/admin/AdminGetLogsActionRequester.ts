import { AdminGetLogsActionRequester } from './AdminGetLogsActionTypes';
import { AdminActionType } from './AdminActionType';

export function* askAdminGetLogs(
  runtimeType: string,
  startIsoDateTime: string,
  endIsoDateTime: string,
  nextPageKey?: string,
): AdminGetLogsActionRequester {
  return yield {
    type: AdminActionType.GetLogs,
    payload: {
      runtimeType,
      nextPageKey,
      startIsoDateTime,
      endIsoDateTime,
    },
  };
}
