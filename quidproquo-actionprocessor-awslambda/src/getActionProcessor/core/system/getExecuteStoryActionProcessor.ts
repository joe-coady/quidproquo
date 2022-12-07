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
  ErrorActionType,
} from 'quidproquo-core';

import { QPQAWSLambdaConfig } from '../../../runtimeConfig/QPQAWSLambdaConfig';
import getFileActionProcessors from '../file';

import { coreActionProcessor, webserverActionProcessor } from 'quidproquo-actionprocessor-node';

import { randomGuid, loadModule } from './../../../awsLambdaUtils';

export const getDateNow = () => new Date().toISOString();

const getProcessExecuteStory = <T extends Array<any>>(
  runtimeConfig: QPQAWSLambdaConfig,
): SystemExecuteStoryActionProcessor<T> => {
  return async (
    payload: SystemExecuteStoryActionPayload<T>,
    session: StorySession,
  ): Promise<any> => {
    let module = await loadModule(payload.src);
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

    const allActionProcessors = {
      ...coreActionProcessor,
      ...webserverActionProcessor,
      ...getFileActionProcessors(runtimeConfig),
    };

    const resolveStory = createRuntime(
      session,
      allActionProcessors,
      getDateNow,
      logger,
      randomGuid,
    );
    const storyResult = await resolveStory(story, payload.params);

    if (storyResult.error) {
      return actionResultError(
        storyResult.error.errorType,
        `story error! in ${payload.src}::${payload.runtime} -> [${storyResult.error.errorText}]`,
        storyResult.error.errorStack,
      );
    }

    return actionResult({
      result: storyResult.result,
      session: storyResult.session,
    });
  };
};

export default (runtimeConfig: QPQAWSLambdaConfig) => {
  // const appName = qpqCoreUtils.getAppName(config);

  return {
    [SystemActionType.ExecuteStory]: getProcessExecuteStory(runtimeConfig),
  };
};
