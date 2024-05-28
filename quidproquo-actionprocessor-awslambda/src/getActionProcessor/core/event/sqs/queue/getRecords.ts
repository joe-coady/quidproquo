import { EventActionType, QPQConfig, actionResult, qpqCoreUtils, HTTPMethod, EventGetRecordsActionProcessor, QueueMessage } from 'quidproquo-core';

import { EventInput, InternalEventRecord } from './types';

const getProcessGetRecords = (qpqConfig: QPQConfig): EventGetRecordsActionProcessor<EventInput, InternalEventRecord> => {
  return async ({ eventParams: [sqsEvent, context] }) => {
    const records = sqsEvent.Records.map((record) => {
      const parsedInternalEventRecord = JSON.parse(record.body) as InternalEventRecord;

      // TODO: Remove the session from this object
      //       note: we still need to access the session in the story execution for depth and auth etc.
      const internalEventRecord: InternalEventRecord = {
        type: parsedInternalEventRecord.type || 'AWS_ALARM',
        payload: parsedInternalEventRecord.payload || {},
        storySession: parsedInternalEventRecord.storySession || {},
      };

      return internalEventRecord;
    });

    return actionResult(records);
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [EventActionType.GetRecords]: getProcessGetRecords(qpqConfig),
  };
};
