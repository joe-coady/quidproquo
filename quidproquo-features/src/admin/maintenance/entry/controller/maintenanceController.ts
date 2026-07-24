import { AskResponse } from 'quidproquo-core';
import { askFromJsonEventRequest, HTTPEvent, HTTPEventResponse, toJsonEventResponse } from 'quidproquo-webserver';

import { WebSocketQueueServerEventPayloadMaintenance } from '../../../../webSocketQueue/types/serverMessages/WebSocketQueueServerEventMessageMaintenance';
import { askSetMaintenanceMode } from '../../logic/askSetMaintenanceMode';

export function* setMaintenance(event: HTTPEvent): AskResponse<HTTPEventResponse> {
  const maintenance = yield* askFromJsonEventRequest<WebSocketQueueServerEventPayloadMaintenance>(event);

  yield* askSetMaintenanceMode(maintenance);

  return toJsonEventResponse({ ok: true });
}
