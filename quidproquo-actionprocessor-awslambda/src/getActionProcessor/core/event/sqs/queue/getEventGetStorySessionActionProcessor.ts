import { actionResult, askEventGetStorySessionBase, createActionProcessor, EventActionType, ProcessorFor, QPQConfig } from 'quidproquo-core';

import { AnyQueueMessageWithSession, EventInput, InternalEventRecord, MatchResult } from './types';

const getProcessGetStorySession = (qpqConfig: QPQConfig): ProcessorFor<typeof askEventGetStorySessionBase> => {
  return async ({ eventParams, qpqEventRecord: rawQpqEventRecord }) => {
    // Registered for one event source only, so the base requester's
    // source-agnostic payload is narrowed to this source's types here.
    const [sqsEvent] = eventParams as EventInput;
    const qpqEventRecord = rawQpqEventRecord as InternalEventRecord;

    // Find the src record and pull out the session from that if we can
    const srcRecord = sqsEvent.Records.find((r) => r.messageId === qpqEventRecord.id);
    if (srcRecord) {
      const parsedInternalEventRecord = JSON.parse(srcRecord.body) as AnyQueueMessageWithSession;
      return actionResult(parsedInternalEventRecord.storySession);
    }

    return actionResult(void 0);
  };
};

export const getEventGetStorySessionActionProcessor = createActionProcessor(askEventGetStorySessionBase, getProcessGetStorySession);
