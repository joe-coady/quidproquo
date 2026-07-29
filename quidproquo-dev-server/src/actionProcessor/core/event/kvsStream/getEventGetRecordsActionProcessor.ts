import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  EventActionType,
  EventGetRecordsActionProcessor,
  QPQConfig,
} from 'quidproquo-core';

import { EventInput, InternalEventRecord } from './types';

// The local backend already builds the record in its final shape (it stores items raw and
// partitions by scope at the file level, so there is no composed key to take apart), so this
// is a passthrough rather than the unmarshal-and-decompose the DynamoDB processor does.
const getProcessGetRecords = (qpqConfig: QPQConfig): EventGetRecordsActionProcessor<EventInput, InternalEventRecord> => {
  return async ({ eventParams: [event] }) => actionResult([event.record]);
};

export const getEventGetRecordsActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [EventActionType.GetRecords]: getProcessGetRecords(qpqConfig),
});
