import { AskResponse } from 'quidproquo-core';
import { WebsocketEvent } from '../../../../types';

export function* onConnect(event: WebsocketEvent): AskResponse<void> {}

export function* onDisconnect(event: WebsocketEvent): AskResponse<void> {}

export function* onMessage(event: WebsocketEvent): AskResponse<void> {}
