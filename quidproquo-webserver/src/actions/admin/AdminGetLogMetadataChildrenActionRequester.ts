import { AdminActionType } from './AdminActionType';
import { AdminGetLogMetadataChildrenActionRequester } from './AdminGetLogMetadataChildrenActionTypes';

export function* askAdminGetLogMetadataChildren(correlationId: string, nextPageKey?: string): AdminGetLogMetadataChildrenActionRequester {
  return yield {
    type: AdminActionType.GetLogMetadataChildren,
    payload: {
      correlationId,
      nextPageKey,
    },
  };
}
