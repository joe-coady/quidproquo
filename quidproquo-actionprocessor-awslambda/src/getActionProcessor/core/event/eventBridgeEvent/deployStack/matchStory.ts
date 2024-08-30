import {
  ErrorTypeEnum,
  EventActionType,
  EventMatchStoryActionProcessor,
  QPQConfig,
  actionResult,
  actionResultError,
  qpqCoreUtils,
} from 'quidproquo-core';
import { InternalEventRecord, MatchResult } from './types';

// TODO: Globals? Are these bad....
const GLOBAL_DEPLOY_EVENT_NAME = process.env.deployEventConfigName!;

const getProcessMatchStory = (qpqConfig: QPQConfig): EventMatchStoryActionProcessor<InternalEventRecord, MatchResult> => {
  const deployConfig = qpqCoreUtils.getDeployEventConfigs(qpqConfig).find((c) => c.name === GLOBAL_DEPLOY_EVENT_NAME);

  return async ({ qpqEventRecord }) => {
    if (!deployConfig) {
      return actionResultError(ErrorTypeEnum.NotFound, `Could not find deploy event config ${GLOBAL_DEPLOY_EVENT_NAME}`);
    }

    return actionResult<MatchResult>({
      runtime: deployConfig.runtime,
    });
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [EventActionType.MatchStory]: getProcessMatchStory(qpqConfig),
  };
};
