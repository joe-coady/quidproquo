import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  EventActionType,
  EventGetRecordsActionProcessor,
  QPQConfig,
} from 'quidproquo-core';
import { WebSocketEventType } from 'quidproquo-webserver';

import { EventInput, GLOBAL_WEBSOCKET_API_NAME, InternalEventRecord } from './types';

const awsToQoqEventTypeMap = {
  MESSAGE: WebSocketEventType.Message,
  CONNECT: WebSocketEventType.Connect,
  DISCONNECT: WebSocketEventType.Disconnect,
};

const getProcessGetRecords = (qpqConfig: QPQConfig): EventGetRecordsActionProcessor<EventInput, InternalEventRecord> => {
  return async ({ eventParams: [websocketEvent, context] }) => {
    const internalEventRecord: InternalEventRecord = {
      eventType: awsToQoqEventTypeMap[websocketEvent.requestContext.eventType],

      messageId: websocketEvent.requestContext.messageId,
      connectionId: websocketEvent.requestContext.connectionId,
      requestTimeEpoch: websocketEvent.requestContext.requestTimeEpoch,
      sourceIp: websocketEvent.requestContext.identity.sourceIp,
      userAgent: websocketEvent.requestContext.identity.userAgent,
      requestTime: new Date(websocketEvent.requestContext.requestTimeEpoch).toISOString(),
      body: websocketEvent.body as string | Blob | ArrayBuffer | undefined,

      apiName: GLOBAL_WEBSOCKET_API_NAME,
    };

    return actionResult([internalEventRecord]);
  };
};

export const getEventGetRecordsActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [EventActionType.GetRecords]: getProcessGetRecords(qpqConfig),
});
