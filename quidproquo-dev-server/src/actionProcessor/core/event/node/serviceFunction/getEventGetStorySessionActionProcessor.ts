import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  EventActionType,
  EventGetStorySessionActionProcessor,
  QPQConfig,
} from 'quidproquo-core';

import { EventInput, InternalEventRecord, MatchResult } from './types';

const getProcessGetStorySession = (qpqConfig: QPQConfig): EventGetStorySessionActionProcessor<EventInput, InternalEventRecord, MatchResult> => {
  return async ({ qpqEventRecord, eventParams }) => {
    return actionResult(void 0);
  };
};

export const getEventGetStorySessionActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [EventActionType.GetStorySession]: getProcessGetStorySession(qpqConfig),
});
