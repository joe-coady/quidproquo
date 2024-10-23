import { AdminActionType } from './AdminActionType';
import { AdminGetLogActionRequester } from './AdminGetLogActionTypes';

export function* askAdminGetLog(correlationId: string): AdminGetLogActionRequester {
  return yield {
    type: AdminActionType.GetLog,
    payload: {
      correlationId,
    },
  };
}
