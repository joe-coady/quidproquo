import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  EventActionType,
  EventGetStorySessionActionProcessor,
  QPQConfig,
} from 'quidproquo-core';

import { EventInput, InternalEventRecord, MatchResult } from './types';

// A stream record carries no caller identity — the change already happened, under whatever
// authority wrote it. The handler runs with a blank session, like the storage drive event.
const getProcessGetStorySession = (qpqConfig: QPQConfig): EventGetStorySessionActionProcessor<EventInput, InternalEventRecord, MatchResult> => {
  return async ({ qpqEventRecord, eventParams }) => {
    return actionResult(void 0);
  };
};

export const getEventGetStorySessionActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [EventActionType.GetStorySession]: getProcessGetStorySession(qpqConfig),
});
