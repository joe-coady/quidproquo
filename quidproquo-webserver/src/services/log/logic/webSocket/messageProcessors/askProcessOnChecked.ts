import { AnyEventMessage } from 'quidproquo-core';

import { WebSocketClientEventMessageMarkLogChecked, WebsocketClientMessageEventType } from '../../../../../types';
import { askToggleLogChecked } from '../../logs';

export function isWebSocketMarkLogCheckedMessage(event: AnyEventMessage): event is WebSocketClientEventMessageMarkLogChecked {
  return event.type === WebsocketClientMessageEventType.MarkLogChecked;
}

export function* askProcessOnMarkLogChecked(id: string, correlationId: string, checked: boolean) {
  yield* askToggleLogChecked(correlationId, checked);
}
