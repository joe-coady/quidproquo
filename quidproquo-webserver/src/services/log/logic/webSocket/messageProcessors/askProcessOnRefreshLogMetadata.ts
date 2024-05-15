import { AnyEventMessage } from 'quidproquo-core';

import { askAnnounceLogMetadataByCorrelationId, askToggleLogChecked } from '../../logs';
import {
  WebSocketAdminServerEventMessageRefreshLogMetadata,
  WebsocketAdminClientMessageEventType,
} from '../clientMessages';

export function isWebSocketRefreshLogMetadataMessage(
  event: AnyEventMessage,
): event is WebSocketAdminServerEventMessageRefreshLogMetadata {
  return event.type === WebsocketAdminClientMessageEventType.RefreshLogMetadata;
}

export function* askProcessOnRefreshLogMetadata(correlationId: string) {
  yield* askAnnounceLogMetadataByCorrelationId(correlationId);
}
