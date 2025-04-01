import { askLogCreate, AskResponse, LogLevelEnum, QueueEventResponse } from 'quidproquo-core';

import { WebSocketQueueQpqAdminConfigSyncRequestQueueEvent } from '../../../../../services';

export function* onConfigSyncRequest(event: WebSocketQueueQpqAdminConfigSyncRequestQueueEvent): AskResponse<QueueEventResponse> {
  yield* askLogCreate(LogLevelEnum.Info, 'Config sync request received', event);
  return true;
}
