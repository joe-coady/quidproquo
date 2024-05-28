import { EventActionType, QPQConfig, actionResult, EventGetRecordsActionProcessor } from 'quidproquo-core';

import { EventInput, InternalEventRecord } from './types';

const getProcessGetRecords = (qpqConfig: QPQConfig): EventGetRecordsActionProcessor<EventInput, InternalEventRecord> => {
  return async ({ eventParams: [eventBridgeEvent, context] }) => {
    const internalEventRecord: InternalEventRecord = {
      time: eventBridgeEvent.time,
      correlation: context.awsRequestId,
      detail: eventBridgeEvent.detail,
    };

    return actionResult([internalEventRecord]);
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [EventActionType.GetRecords]: getProcessGetRecords(qpqConfig),
  };
};
