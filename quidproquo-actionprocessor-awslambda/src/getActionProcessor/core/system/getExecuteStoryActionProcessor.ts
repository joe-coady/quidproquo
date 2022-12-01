import {
  SystemActionTypeEnum,
  QPQConfig,
  qpqCoreUtils,
  SystemExecuteStoryActionPayload,
  StorySession,
  createRuntime,
} from 'quidproquo-core';

import { coreActionProcessor, webserverActionProcessor } from 'quidproquo-actionprocessor-node';

import { randomGuid } from './../../../awsLambdaUtils';

export const getDateNow = () => new Date().toISOString();

const getProcessExecuteStory = <T extends Array<any>>(appName: string) => {
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
      throw new Error(
        `story error! ${storyResult.error.errorType} in ${payload.src}::${payload.runtime}`,
      );
    }

    return {
      result: storyResult.result,
      session: storyResult.session,
    };
  };
};

export default (config: QPQConfig) => {
  const appName = qpqCoreUtils.getAppName(config);

  return {
    [SystemActionTypeEnum.ExecuteStory]: getProcessExecuteStory(appName),
  };
};
