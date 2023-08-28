import { AskResponse, ErrorTypeEnum, askThrowError } from 'quidproquo-core';
import { WebsocketEvent } from '../types';

export const fromJsonWebsocketEventRequest = <T>(websocketJsonEvent: WebsocketEvent<string>): T => {
  if (!websocketJsonEvent.body) {
    throw new Error('websocketJsonEvent.body is undefined');
  }

  const item: T = JSON.parse(websocketJsonEvent.body);
  return item;
};


export function* askFromJsonWebsocketEventRequest<T>(websocketJsonEvent: WebsocketEvent<string>): AskResponse<T> {
  if (!websocketJsonEvent.body) {
    yield* askThrowError(ErrorTypeEnum.Invalid, 'websocketJsonEvent.body is undefined');
  }

  const item: T = JSON.parse(websocketJsonEvent.body!);
  return item;
};
