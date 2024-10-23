import { AdminActionType } from './AdminActionType';
import { AdminGetLogMetadataActionRequester } from './AdminGetLogMetadataActionTypes';

export function* askAdminGetLogMetadata(correlationId: string): AdminGetLogMetadataActionRequester {
  return yield {
    type: AdminActionType.GetLogMetadata,
    payload: {
      correlationId,
    },
  };
}
