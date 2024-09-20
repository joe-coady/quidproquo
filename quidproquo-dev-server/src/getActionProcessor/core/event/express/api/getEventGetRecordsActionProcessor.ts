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
  (
    _qpqConfig: QPQConfig
  ): EventGetRecordsActionProcessor<EventInput, InternalEventRecord> =>
  async ({ eventParams: [expressEvent] }) => {
    const path = expressEvent.path || '';

    const internalEventRecord: InternalEventRecord = {
      path,
      query: expressEvent.query,
      body: expressEvent.body,
      headers: expressEvent.headers,
      method: expressEvent.method as 'GET' | 'POST' | 'OPTIONS',
      correlation: expressEvent.correlation,
      sourceIp: expressEvent.ip,
      isBase64Encoded: expressEvent.isBase64Encoded,
      files: expressEvent.files,
    };

    return actionResult([internalEventRecord]);
  };

export const getEventGetRecordsActionProcessor: ActionProcessorListResolver =
  async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
    [EventActionType.GetRecords]: getProcessGetRecords(qpqConfig),
  });
