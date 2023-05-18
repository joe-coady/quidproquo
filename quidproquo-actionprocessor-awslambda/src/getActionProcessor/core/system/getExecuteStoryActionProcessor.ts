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
} from 'quidproquo-core';

import { randomGuid } from './../../../awsLambdaUtils';
import { DynamicModuleLoader } from '../../../types/DynamicLoader';

export const getDateNow = () => new Date().toISOString();

const getProcessExecuteStory = <T extends Array<any>>(
  qpqConfig: QPQConfig,
  dynamicModuleLoader: DynamicModuleLoader,
): SystemExecuteStoryActionProcessor<T> => {
  const moduleName = qpqCoreUtils.getApplicationModuleName(qpqConfig);
  return async (
    payload: SystemExecuteStoryActionPayload<T>,
    session: StorySession,
    actionProcessors: ActionProcessorList,
    logger: (result: any) => Promise<void>,
  ): Promise<any> => {
    let module = await dynamicModuleLoader(payload.src);
    if (module === null) {
      return actionResultError(ErrorTypeEnum.NotFound, `Module not found [${payload.src}]`);
    }

    const story = module[payload.runtime];
    if (!story) {
      return actionResultError(
        ErrorTypeEnum.NotFound,
        `[${payload.runtime}] not found in module [${payload.src}]`,
      );
    }

    const resolveStory = createRuntime(
      qpqConfig,
      session,
      actionProcessors,
      getDateNow,
      logger,
      // TODO: Share this logic.
      `${moduleName}::${randomGuid()}`,
      QpqRuntimeType.EXECUTE_STORY,
      [`${payload.src}::${payload.runtime}`],
    );
    const storyResult = await resolveStory(story, payload.params);

    if (storyResult.error) {
      const stack = `${payload.src}::${payload.runtime}`;
      return actionResultError(
        storyResult.error.errorType,
        storyResult.error.errorText,
        storyResult.error.errorStack ? `${stack} -> [${storyResult.error.errorStack}]` : stack,
      );
    }

    return actionResult(storyResult.result);
  };
};

export default (qpqConfig: QPQConfig, dynamicModuleLoader: DynamicModuleLoader) => {
  return {
    [SystemActionType.ExecuteStory]: getProcessExecuteStory(qpqConfig, dynamicModuleLoader),
  };
};
