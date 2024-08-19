import { ErrorTypeEnum, EventActionType, EventMatchStoryActionProcessor, QPQConfig, actionResultError, qpqCoreUtils } from 'quidproquo-core';
import { InternalEventRecord, MatchResult } from './types';
import { actionResult } from 'quidproquo-core';

// TODO: Don't use Globals like this
const GLOBAL_USER_DIRECTORY_NAME = process.env.userDirectoryName!;

const getProcessMatchStory = (qpqConfig: QPQConfig): EventMatchStoryActionProcessor<InternalEventRecord, MatchResult> => {
  const userDirectoryConfig = qpqCoreUtils.getUserDirectories(qpqConfig).find((ud) => ud.name === GLOBAL_USER_DIRECTORY_NAME);

  return async ({ qpqEventRecord }) => {
    if (!userDirectoryConfig || !userDirectoryConfig.customAuthRuntime?.defineAuthChallenge.src) {
      return actionResultError(ErrorTypeEnum.NotFound, `Missing customAuthRuntime.defineAuthChallenge.src in [${GLOBAL_USER_DIRECTORY_NAME}]`);
    }

    return actionResult<MatchResult>({
      src: userDirectoryConfig.customAuthRuntime.defineAuthChallenge.src,
      runtime: userDirectoryConfig.customAuthRuntime.defineAuthChallenge.runtime,
    });
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [EventActionType.MatchStory]: getProcessMatchStory(qpqConfig),
  };
};
