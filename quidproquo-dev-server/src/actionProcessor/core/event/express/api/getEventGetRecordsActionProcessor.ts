import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  EventActionType,
  EventGetRecordsActionProcessor,
  QPQConfig,
} from 'quidproquo-core';

import { EventInput, InternalEventRecord } from './types';

const getProcessGetRecords =
  (_qpqConfig: QPQConfig): EventGetRecordsActionProcessor<EventInput, InternalEventRecord> =>
  async ({ eventParams: [expressEvent] }) => {
    const path = expressEvent.path || '';

    // Mirror AWS API Gateway / Lambda behaviour: incoming bodies arrive base64 encoded
    // with `isBase64Encoded: true`. Always encode locally so devs exercise the same
    // decode path (e.g. qpqWebServerUtils.rawFromJsonEventRequest) they hit in production.
    const body = expressEvent.body !== undefined ? Buffer.from(expressEvent.body).toString('base64') : undefined;

    const internalEventRecord: InternalEventRecord = {
      path,
      query: expressEvent.query,
      body,
      headers: expressEvent.headers,
      method: expressEvent.method as 'GET' | 'POST' | 'OPTIONS',
      correlation: expressEvent.correlation,
      sourceIp: expressEvent.ip,
      isBase64Encoded: true,
      files: expressEvent.files,
    };

    return actionResult([internalEventRecord]);
  };

export const getEventGetRecordsActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [EventActionType.GetRecords]: getProcessGetRecords(qpqConfig),
});
