import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  EventActionType,
  EventGetStorySessionActionProcessor,
  QPQConfig,
} from 'quidproquo-core';

import { AnyQueueMessageWithSession, EventInput, InternalEventRecord, MatchResult } from './types';

const getProcessGetStorySession = (qpqConfig: QPQConfig): EventGetStorySessionActionProcessor<EventInput, InternalEventRecord, MatchResult> => {
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

export const getEventGetStorySessionActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [EventActionType.GetStorySession]: getProcessGetStorySession(qpqConfig),
});
