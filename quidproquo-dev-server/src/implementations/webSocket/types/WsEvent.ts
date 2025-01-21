import { WebSocketEventType } from 'quidproquo';

export type WsEvent = {
  apiName: string;
  service: string;
  eventType: WebSocketEventType;
  body?: ArrayBuffer | Buffer | Buffer[];

  messageId: string;
  connectionId: string;
  requestTimeEpoch: number;
  sourceIp: string;
  userAgent: string;
};
