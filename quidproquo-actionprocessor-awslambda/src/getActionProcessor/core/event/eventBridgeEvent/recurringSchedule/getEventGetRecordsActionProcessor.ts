import {
  EventActionType,
  QPQConfig,
  actionResult,
  EventGetRecordsActionProcessor,
  ActionProcessorListResolver,
  ActionProcessorList,
} from 'quidproquo-core';

import { EventInput, InternalEventRecord } from './types';

const getProcessGetRecords = (qpqConfig: QPQConfig): EventGetRecordsActionProcessor<EventInput, InternalEventRecord> => {
  return async ({ eventParams: [eventBridgeEvent, context] }) => {
    const internalEventRecord: InternalEventRecord = {
      time: eventBridgeEvent.time,
      correlation: context.awsRequestId,
      metadata: eventBridgeEvent.detail,
    };

    return actionResult([internalEventRecord]);
  };
};

export const getEventGetRecordsActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [EventActionType.GetRecords]: getProcessGetRecords(qpqConfig),
});
