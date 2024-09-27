import {
  EventActionType,
  QPQConfig,
  actionResult,
  EventGetRecordsActionProcessor,
  ActionProcessorListResolver,
  ActionProcessorList,
} from 'quidproquo-core';

import { EventInput, InternalEventRecord } from './types';
import { WebSocketEventType } from 'quidproquo-webserver';

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
    };

    return actionResult([internalEventRecord]);
  };
};

export const getEventGetRecordsActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [EventActionType.GetRecords]: getProcessGetRecords(qpqConfig),
});
