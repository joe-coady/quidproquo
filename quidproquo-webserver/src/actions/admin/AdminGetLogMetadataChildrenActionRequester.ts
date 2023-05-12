import { AdminGetLogMetadataChildrenActionRequester } from './AdminGetLogMetadataChildrenActionTypes';
import { AdminActionType } from './AdminActionType';

export function* askAdminGetLogMetadataChildren(
  correlationId: string,
): AdminGetLogMetadataChildrenActionRequester {
  return yield {
    type: AdminActionType.GetLogMetadataChildren,
    payload: {
      correlationId,
    },
  };
}
