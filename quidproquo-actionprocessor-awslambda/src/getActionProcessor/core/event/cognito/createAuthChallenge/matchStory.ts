import { ErrorTypeEnum, EventActionType, EventMatchStoryActionProcessor, QPQConfig, actionResultError, qpqCoreUtils } from 'quidproquo-core';
import { InternalEventRecord, MatchResult } from './types';
import { actionResult } from 'quidproquo-core';

// TODO: Don't use Globals like this
const GLOBAL_USER_DIRECTORY_NAME = process.env.userDirectoryName!;

const getProcessMatchStory = (qpqConfig: QPQConfig): EventMatchStoryActionProcessor<InternalEventRecord, MatchResult> => {
  const userDirectoryConfig = qpqCoreUtils.getUserDirectories(qpqConfig).find((ud) => ud.name === GLOBAL_USER_DIRECTORY_NAME);

  return async ({ qpqEventRecord }) => {
    if (!userDirectoryConfig?.customAuthRuntime?.createAuthChallenge?.src) {
      return actionResultError(ErrorTypeEnum.NotFound, `Missing customAuthRuntime.createAuthChallenge.src in [${GLOBAL_USER_DIRECTORY_NAME}]`);
    }

    return actionResult<MatchResult>({
      src: userDirectoryConfig.customAuthRuntime.createAuthChallenge.src,
      runtime: userDirectoryConfig.customAuthRuntime.createAuthChallenge.runtime,
    });
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [EventActionType.MatchStory]: getProcessMatchStory(qpqConfig),
  };
};
