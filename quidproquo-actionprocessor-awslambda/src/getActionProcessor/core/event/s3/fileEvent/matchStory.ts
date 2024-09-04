import { EventActionType, EventMatchStoryActionProcessor, QPQConfig, actionResult } from 'quidproquo-core';
import { GLOBAL_STORAGE_DRIVE_RUNTIME, InternalEventRecord, MatchResult } from './types';

const getProcessMatchStory = (qpqConfig: QPQConfig): EventMatchStoryActionProcessor<InternalEventRecord, MatchResult> => {
  return async ({ qpqEventRecord }) => {
    return actionResult<MatchResult>({
      runtime: GLOBAL_STORAGE_DRIVE_RUNTIME,
    });
  };
};
export default (qpqConfig: QPQConfig) => {
  return {
    [EventActionType.MatchStory]: getProcessMatchStory(qpqConfig),
  };
};
