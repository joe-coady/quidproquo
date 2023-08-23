
export enum WebSocketEventType {
  Connect = 'CONNECT',
  Disconnect = 'DISCONNECT',
  Message = 'MESSAGE',
}

export type WebsocketEvent<T extends string | Blob | ArrayBuffer> = {
  eventType: WebSocketEventType;
  messageId: string;
  connectionId: string;
  requestTime: string;
  requestTimeEpoch: string;

  userAgent: string;
  sourceIp: string;

  body: T;
}

export type WebsocketEventResponse = void;
