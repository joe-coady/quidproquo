import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResultError,
  ErrorTypeEnum,
  EventActionType,
  EventMatchStoryActionProcessor,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';
import { actionResult } from 'quidproquo-core';

import { EventInput, InternalEventRecord, MatchResult } from './types';

// TODO: Don't use Globals like this
const GLOBAL_USER_DIRECTORY_NAME = process.env.userDirectoryName!;

const getProcessMatchStory = (qpqConfig: QPQConfig): EventMatchStoryActionProcessor<InternalEventRecord, MatchResult, EventInput> => {
  const userDirectoryConfig = qpqCoreUtils.getUserDirectories(qpqConfig).find((ud) => ud.name === GLOBAL_USER_DIRECTORY_NAME);

  return async ({ qpqEventRecord }) => {
    if (!userDirectoryConfig || !userDirectoryConfig.customAuthRuntime?.defineAuthChallenge) {
      return actionResultError(ErrorTypeEnum.NotFound, `Missing customAuthRuntime.defineAuthChallenge in [${GLOBAL_USER_DIRECTORY_NAME}]`);
    }

    return actionResult<MatchResult>({
      runtime: userDirectoryConfig.customAuthRuntime.defineAuthChallenge,
    });
  };
};

export const getEventMatchStoryActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [EventActionType.MatchStory]: getProcessMatchStory(qpqConfig),
});
