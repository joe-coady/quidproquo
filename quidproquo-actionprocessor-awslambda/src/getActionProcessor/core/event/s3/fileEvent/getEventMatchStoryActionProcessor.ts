import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  EventActionType,
  EventMatchStoryActionProcessor,
  QPQConfig,
} from 'quidproquo-core';

import { GLOBAL_STORAGE_DRIVE_RUNTIME, InternalEventRecord, MatchResult } from './types';

const getProcessMatchStory = (qpqConfig: QPQConfig): EventMatchStoryActionProcessor<InternalEventRecord, MatchResult> => {
  return async ({ qpqEventRecord }) => {
    return actionResult<MatchResult>({
      runtime: GLOBAL_STORAGE_DRIVE_RUNTIME,
    });
  };
};

export const getEventMatchStoryActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [EventActionType.MatchStory]: getProcessMatchStory(qpqConfig),
});
