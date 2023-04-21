import {
  SystemActionType,
  QPQConfig,
  qpqCoreUtils,
  SystemExecuteStoryActionPayload,
  StorySession,
  createRuntime,
  SystemExecuteStoryActionProcessor,
  actionResultError,
  ErrorTypeEnum,
  actionResult,
  ActionProcessorList,
  QpqRuntimeType,
} from 'quidproquo-core';

import { randomGuid } from './../../../awsLambdaUtils';
import { DynamicModuleLoader } from '../../../types/DynamicLoader';

export const getDateNow = () => new Date().toISOString();

const getProcessExecuteStory = <T extends Array<any>>(
  dynamicModuleLoader: DynamicModuleLoader,
): SystemExecuteStoryActionProcessor<T> => {
  return async (
    payload: SystemExecuteStoryActionPayload<T>,
    session: StorySession,
    actionProcessors: ActionProcessorList,
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

    const logger = async (result: any) => {
      // return await addResult(service, getDateNow(), payload.params[0][0].path, 'user-route', payload.src, payload.runtime, result);
    };

    const resolveStory = createRuntime(
      session,
      actionProcessors,
      getDateNow,
      logger,
      randomGuid,
      QpqRuntimeType.EXECUTE_STORY,
    );
    const storyResult = await resolveStory(story, payload.params);

    if (storyResult.error) {
      return actionResultError(
        storyResult.error.errorType,
        `story error! in ${payload.src}::${payload.runtime} -> [${storyResult.error.errorText}]`,
        storyResult.error.errorStack,
      );
    }

    return actionResult(storyResult.result);
  };
};

export default (dynamicModuleLoader: DynamicModuleLoader) => {
  return {
    [SystemActionType.ExecuteStory]: getProcessExecuteStory(dynamicModuleLoader),
  };
};
