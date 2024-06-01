import { EventActionType, QPQConfig, actionResult, EventGetStorySessionActionProcessor } from 'quidproquo-core';

import { AnyQueueMessageWithSession, EventInput, InternalEventRecord } from './types';

const getProcessGetStorySession = (qpqConfig: QPQConfig): EventGetStorySessionActionProcessor<EventInput, InternalEventRecord> => {
  return async ({ qpqEventRecord, eventParams: [sqsEvent] }) => {
    // Find the src record and pull out the session from that if we can
    const srcRecord = sqsEvent.Records.find((r) => r.messageId === qpqEventRecord.id);
    if (srcRecord) {
      const parsedInternalEventRecord = JSON.parse(srcRecord.body) as AnyQueueMessageWithSession;
      return actionResult(parsedInternalEventRecord.storySession);
    }

    return actionResult(void 0);
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [EventActionType.GetStorySession]: getProcessGetStorySession(qpqConfig),
  };
};
