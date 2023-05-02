import { AdminGetLogsActionRequester } from './AdminGetLogsActionTypes';
import { AdminActionType } from './AdminActionType';

export function* askAdminGetLogs(): AdminGetLogsActionRequester {
  return yield {
    type: AdminActionType.GetLogs,
    payload: {},
  };
}
