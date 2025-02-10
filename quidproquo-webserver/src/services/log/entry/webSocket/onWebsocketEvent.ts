import { askLog, AskResponse } from 'quidproquo-core';

import { WebsocketEvent } from '../../../../types';

export function* onConnect(event: WebsocketEvent): AskResponse<void> {
  yield* askLog`Admin websocket deprecated: [onConnect]`;
}

export function* onDisconnect(event: WebsocketEvent): AskResponse<void> {
  yield* askLog`Admin websocket deprecated: [onDisconnect]`;
}

export function* onMessage(event: WebsocketEvent): AskResponse<void> {
  yield* askLog`Admin websocket deprecated: [onMessage]`;
}
