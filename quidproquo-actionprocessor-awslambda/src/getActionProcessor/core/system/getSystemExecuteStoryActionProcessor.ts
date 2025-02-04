import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  createRuntime,
  DynamicModuleLoader,
  ErrorTypeEnum,
  QPQConfig,
  qpqCoreUtils,
  QpqLogger,
  QpqRuntimeType,
  StorySession,
  StorySessionUpdater,
  SystemActionType,
  SystemExecuteStoryActionPayload,
  SystemExecuteStoryActionProcessor,
} from 'quidproquo-core';

import { randomGuid } from '../../../awsLambdaUtils';

export const getDateNow = () => new Date().toISOString();

const getProcessExecuteStory = <T extends Array<any>, R>(qpqConfig: QPQConfig): SystemExecuteStoryActionProcessor<T, R> => {
  const moduleName = qpqCoreUtils.getApplicationModuleName(qpqConfig);
  return async (
    payload: SystemExecuteStoryActionPayload<T>,
    session: StorySession,
    actionProcessors: ActionProcessorList,
    logger: QpqLogger,
    updateSession: StorySessionUpdater,
    dynamicModuleLoader: DynamicModuleLoader,
  ): Promise<any> => {
    let story = await dynamicModuleLoader(payload.runtime);

    if (!story) {
      return actionResultError(ErrorTypeEnum.NotFound, `Unable to dynamically load: [${payload.runtime}]`);
    }

    const resolveStory = createRuntime(
      qpqConfig,
      {
        context: payload.storySession?.context || session.context,
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

export const getSystemExecuteStoryActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [SystemActionType.ExecuteStory]: getProcessExecuteStory(qpqConfig),
});
