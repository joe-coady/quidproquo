import {
  SystemActionType,
  QPQConfig,
  SystemExecuteStoryActionPayload,
  StorySession,
  createRuntime,
  SystemExecuteStoryActionProcessor,
  actionResultError,
  ErrorTypeEnum,
  actionResult,
  ActionProcessorList,
  QpqRuntimeType,
  qpqCoreUtils,
  QpqLogger,
} from 'quidproquo-core';

import { randomGuid } from './../../../awsLambdaUtils';
import { DynamicModuleLoader } from '../../../types/DynamicLoader';

export const getDateNow = () => new Date().toISOString();

const getProcessExecuteStory = <T extends Array<any>, R>(
  qpqConfig: QPQConfig,
  dynamicModuleLoader: DynamicModuleLoader,
): SystemExecuteStoryActionProcessor<T, R> => {
  const moduleName = qpqCoreUtils.getApplicationModuleName(qpqConfig);
  return async (
    payload: SystemExecuteStoryActionPayload<T>,
    session: StorySession,
    actionProcessors: ActionProcessorList,
    logger: QpqLogger,
  ): Promise<any> => {
    console.log('Trying to load module');
    let story = await dynamicModuleLoader(payload.runtime);
    console.log('After - Trying to load module');
    if (!story) {
      console.log('No story');
      return actionResultError(ErrorTypeEnum.NotFound, `Unable to dynamically load: [${payload.runtime}]`);
    }

    const resolveStory = createRuntime(
      qpqConfig,
      {
        context: payload.storySession?.context || session.context,
        depth: (payload.storySession?.depth || session.depth || 0) + 1,
        accessToken: payload.storySession?.accessToken || session.accessToken,
        correlation: payload.storySession?.correlation || session.correlation,
      },
      async () => actionProcessors,
      getDateNow,
      logger,
      // TODO: Share this logic.
      `${moduleName}::${randomGuid()}`,
      QpqRuntimeType.EXECUTE_STORY,
      [payload.runtime],
    );
    const storyResult = await resolveStory(story, payload.params);

    if (storyResult.error) {
      return actionResultError(
        storyResult.error.errorType,
        storyResult.error.errorText,
        storyResult.error.errorStack ? `${payload.runtime} -> [${storyResult.error.errorStack}]` : payload.runtime,
      );
    }

    return actionResult<R>(storyResult.result);
  };
};

export default (qpqConfig: QPQConfig, dynamicModuleLoader: DynamicModuleLoader) => {
  return {
    [SystemActionType.ExecuteStory]: getProcessExecuteStory(qpqConfig, dynamicModuleLoader),
  };
};
