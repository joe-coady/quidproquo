import {
  actionResult,
  actionResultError,
  askExecuteStoryBase,
  createActionProcessor,
  createRuntime,
  ErrorTypeEnum,
  getUniqueKeyFromQpqFunctionRuntime,
  ProcessorFor,
  QPQConfig,
  qpqCoreUtils,
  QpqRuntimeType,
} from 'quidproquo-core';

import { randomGuid } from '../../../awsLambdaUtils';
import { getDateNow } from './getDateNow';

const getProcessExecuteStory = (qpqConfig: QPQConfig): ProcessorFor<typeof askExecuteStoryBase> => {
  const moduleName = qpqCoreUtils.getApplicationModuleName(qpqConfig);
  return async (payload, session, actionProcessors, logger, updateSession, dynamicModuleLoader) => {
    const story = await dynamicModuleLoader(payload.runtime);

    if (!story) {
      return actionResultError(ErrorTypeEnum.NotFound, `Unable to dynamically load: [${payload.runtime}]`);
    }

    const functionKey = getUniqueKeyFromQpqFunctionRuntime(payload.runtime);

    const resolveStory = createRuntime(
      qpqConfig,
      {
        context: payload.storySession?.context || session.context,
        localContext: payload.storySession?.localContext || session.localContext,
        depth: (payload.storySession?.depth || session.depth || 0) + 1,
        decodedAccessToken: payload.storySession?.decodedAccessToken || session.decodedAccessToken,
        correlation: payload.storySession?.correlation || session.correlation,
      },
      async () => actionProcessors,
      getDateNow,
      logger,
      // TODO: Share this logic.
      `${moduleName}::${randomGuid()}`,
      QpqRuntimeType.EXECUTE_STORY,
      dynamicModuleLoader,
      payload.runtime,
      [],
    );
    const storyResult = await resolveStory(story, payload.params);

    if (storyResult.error) {
      return actionResultError(
        storyResult.error.errorType,
        storyResult.error.errorText,
        storyResult.error.errorStack ? `${functionKey} -> [${storyResult.error.errorStack}]` : functionKey,
      );
    }

    return actionResult(storyResult.result);
  };
};

export const getSystemExecuteStoryActionProcessor = createActionProcessor(askExecuteStoryBase, getProcessExecuteStory);
