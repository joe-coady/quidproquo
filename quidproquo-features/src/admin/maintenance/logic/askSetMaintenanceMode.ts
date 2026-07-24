import { askConfigGetGlobal, AskResponse, askThrowError, ErrorTypeEnum } from 'quidproquo-core';

import { askWebSocketQueueBroadcastMessage } from '../../../webSocketQueue/logic/webSocket/askWebSocketQueueBroadcastMessage';
import {
  WebSocketQueueServerEventMessageMaintenance,
  WebSocketQueueServerEventPayloadMaintenance,
} from '../../../webSocketQueue/types/serverMessages/WebSocketQueueServerEventMessageMaintenance';
import { WebSocketQueueServerMessageEventType } from '../../../webSocketQueue/types/serverMessages/WebSocketQueueServerMessageEventType';
import { QPQ_ADMIN_MAINTENANCE_WS_API_GLOBAL } from '../config/maintenanceWebsocketApiGlobal';

// Broadcast a maintenance begin/end to every connection on the APPLICATION
// websocket (the api named by the maintenance global — the admin's own socket
// is a different api and is deliberately not used here).
export function* askSetMaintenanceMode(maintenance: WebSocketQueueServerEventPayloadMaintenance): AskResponse<void> {
  const websocketApiName = yield* askConfigGetGlobal<string>(QPQ_ADMIN_MAINTENANCE_WS_API_GLOBAL);

  if (!websocketApiName) {
    return yield* askThrowError(
      ErrorTypeEnum.NotFound,
      'No maintenance websocket api configured - set maintenanceWebsocketApiName in defineAdminSettings',
    );
  }

  yield* askWebSocketQueueBroadcastMessage<WebSocketQueueServerEventMessageMaintenance>(websocketApiName, {
    type: WebSocketQueueServerMessageEventType.Maintenance,
    payload: maintenance,
  });
}
