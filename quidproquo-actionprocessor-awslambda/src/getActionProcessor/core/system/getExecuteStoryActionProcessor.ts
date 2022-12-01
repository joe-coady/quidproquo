import {
  SystemActionTypeEnum,
  QPQConfig,
  qpqCoreUtils,
  SystemExecuteStoryActionPayload,
  StorySession,
  resolveStory,
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

    const logger = async (result: any) => {
      // return await addResult(service, getDateNow(), payload.params[0][0].path, 'user-route', payload.src, payload.runtime, result);
    };

    const actionProcessors = {
      ...coreActionProcessor,
      ...webserverActionProcessor,
    };

    const result = await resolveStory(
      story,
      payload.params,
      session,
      actionProcessors,
      getDateNow,
      logger,
      randomGuid,
    );

    console.log('result from getProcessExecuteStory');

    return {
      result: result.result,
      session: result.session,
    };
  };
};

export default (config: QPQConfig) => {
  const appName = qpqCoreUtils.getAppName(config);

  return {
    [SystemActionTypeEnum.ExecuteStory]: getProcessExecuteStory(appName),
  };
};
