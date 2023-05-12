import { AdminGetLogMetadataActionRequester } from './AdminGetLogMetadataActionTypes';
import { AdminActionType } from './AdminActionType';

export function* askAdminGetLogMetadata(correlationId: string): AdminGetLogMetadataActionRequester {
  return yield {
    type: AdminActionType.GetLogMetadata,
    payload: {
      correlationId,
    },
  };
}
