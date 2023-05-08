import { AdminGetLogActionRequester } from './AdminGetLogActionTypes';
import { AdminActionType } from './AdminActionType';

export function* askAdminGetLog(correlationId: string): AdminGetLogActionRequester {
  return yield {
    type: AdminActionType.GetLog,
    payload: {
      correlationId,
    },
  };
}
