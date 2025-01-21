import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  EventActionType,
  EventGetRecordsActionProcessor,
  QPQConfig,
} from 'quidproquo-core';

import { EventInput, InternalEventRecord } from './types';

function processBody(body: ArrayBuffer | Buffer | Buffer[] | undefined): string | undefined {
  if (!body) {
    return undefined; // If the body is undefined, return undefined
  }

  // Convert the body to a string
  if (Array.isArray(body)) {
    // Merge Buffer[] into a single Buffer and convert to string
    return Buffer.concat(body).toString();
  } else if (body instanceof ArrayBuffer) {
    // Convert ArrayBuffer to string
    return Buffer.from(body).toString();
  } else if (Buffer.isBuffer(body)) {
    return body.toString(); // Convert Buffer to string
  }

  throw new Error('Unsupported body type');
}

const getProcessGetRecords = (qpqConfig: QPQConfig): EventGetRecordsActionProcessor<EventInput, InternalEventRecord> => {
  return async ({ eventParams: [wsEvent] }) => {
    const internalEventRecord: InternalEventRecord = {
      eventType: wsEvent.eventType,

      messageId: wsEvent.messageId,
      connectionId: wsEvent.connectionId,
      requestTimeEpoch: wsEvent.requestTimeEpoch,
      sourceIp: wsEvent.sourceIp,
      userAgent: wsEvent.userAgent,
      requestTime: new Date(wsEvent.requestTimeEpoch).toISOString(),
      body: processBody(wsEvent.body),
      apiName: wsEvent.apiName,
    };

    return actionResult([internalEventRecord]);
  };
};

export const getEventGetRecordsActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [EventActionType.GetRecords]: getProcessGetRecords(qpqConfig),
});
