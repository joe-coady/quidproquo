import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  EventActionType,
  EventMatchStoryActionProcessor,
  QPQConfig,
} from 'quidproquo-core';

import { EventInput, InternalEventRecord, MatchResult } from './types';

// The store's configured handler travels with the message: the backend already resolved it
// from the store config when it decided to emit at all.
const getProcessMatchStory = (qpqConfig: QPQConfig): EventMatchStoryActionProcessor<InternalEventRecord, MatchResult, EventInput> => {
  return async ({ eventParams: [event] }) => actionResult<MatchResult>({ runtime: event.runtime });
};

export const getEventMatchStoryActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [EventActionType.MatchStory]: getProcessMatchStory(qpqConfig),
});
