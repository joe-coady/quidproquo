import { createContextIdentifier, createContextProvider, createContextReader } from 'quidproquo-core';

export type WebsocketConnectionInfo = {
  connectionId?: string;
  correlationId?: string;
};

const websocketConnectionInfoContextDefaultValue: WebsocketConnectionInfo = {};

export const websocketConnectionInfoContext = createContextIdentifier('websocket-connection-info', websocketConnectionInfoContextDefaultValue);

export const askWebsocketReadConnectionInfo = createContextReader(websocketConnectionInfoContext);

export const askWebsocketProvideConnectionInfo = createContextProvider(websocketConnectionInfoContext, (context: WebsocketConnectionInfo) => context);
