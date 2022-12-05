import {
  SystemActionType,
  QPQConfig,
  qpqCoreUtils,
  SystemExecuteStoryActionPayload,
  StorySession,
  createRuntime,
  SystemExecuteStoryActionProcessor,
  actionResultError,
  actionResult,
} from 'quidproquo-core';

import { coreActionProcessor, webserverActionProcessor } from 'quidproquo-actionprocessor-node';

import { randomGuid } from './../../../awsLambdaUtils';

export const getDateNow = () => new Date().toISOString();

const getProcessExecuteStory = <T extends Array<any>>(
  appName: string,
): SystemExecuteStoryActionProcessor<T> => {
  return async (
    payload: SystemExecuteStoryActionPayload<T>,
    session: StorySession,
  ): Promise<any> => {
    const module = require(payload.src);
    const story = module[payload.runtime];

    if (!story) {
      throw new Error(`Unable to process ${payload.src}::${payload.runtime}`);
    }

    const logger = async (result: any) => {
      // return await addResult(service, getDateNow(), payload.params[0][0].path, 'user-route', payload.src, payload.runtime, result);
    };

    const actionProcessors = {
      ...coreActionProcessor,
      ...webserverActionProcessor,
    };

    const resolveStory = createRuntime(session, actionProcessors, getDateNow, logger, randomGuid);
    const storyResult = await resolveStory(story, payload.params);

    if (storyResult.error) {
      return actionResultError(
        storyResult.error.errorType,
        `story error! in ${payload.src}::${payload.runtime}`,
      );
    }

    return actionResult({
      result: storyResult.result,
      session: storyResult.session,
    });
  };
};

export default (config: QPQConfig) => {
  const appName = qpqCoreUtils.getAppName(config);

  return {
    [SystemActionType.ExecuteStory]: getProcessExecuteStory(appName),
  };
};
