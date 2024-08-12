import { EventActionType, QPQConfig, actionResult, EventGetStorySessionActionProcessor } from 'quidproquo-core';

import { EventInput, InternalEventRecord } from './types';

const getProcessGetStorySession = (qpqConfig: QPQConfig): EventGetStorySessionActionProcessor<EventInput, InternalEventRecord> => {
  return async ({ qpqEventRecord, eventParams }) => {
    return actionResult(void 0);
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [EventActionType.GetStorySession]: getProcessGetStorySession(qpqConfig),
  };
};
