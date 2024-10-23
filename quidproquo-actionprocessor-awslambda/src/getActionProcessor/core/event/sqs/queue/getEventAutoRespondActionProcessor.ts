import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  EventActionType,
  EventAutoRespondActionProcessor,
  QPQConfig,
} from 'quidproquo-core';

import { InternalEventOutput, InternalEventRecord, MatchResult } from './types';

const getProcessAutoRespond = (qpqConfig: QPQConfig): EventAutoRespondActionProcessor<InternalEventRecord, MatchResult, InternalEventOutput> => {
  return async ({ matchResult }) => {
    // If we could not match, we can just auto respond...
    if (!matchResult.runtime) {
      // Just say we have finished gracefully.
      return actionResult(true);
    }

    return actionResult(null);
  };
};

export const getEventAutoRespondActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [EventActionType.AutoRespond]: getProcessAutoRespond(qpqConfig),
});
