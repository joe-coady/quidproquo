import { AdminGetLogMetadataChildrenActionRequester } from './AdminGetLogMetadataChildrenActionTypes';
import { AdminActionType } from './AdminActionType';

export function* askAdminGetLogMetadataChildren(
  correlationId: string,
  nextPageKey?: string,
): AdminGetLogMetadataChildrenActionRequester {
  return yield {
    type: AdminActionType.GetLogMetadataChildren,
    payload: {
      correlationId,
      nextPageKey,
    },
  };
}
