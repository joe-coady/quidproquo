import { coreActionProcessor, webserverActionProcessor } from 'quidproquo-actionprocessor-node';
import { ExecuteServiceFunctionEvent } from 'quidproquo-webserver';

import {
  getServiceFunctionExecuteEventActionProcessor,
  getSystemActionProcessor,
  getFileActionProcessor,
  getQueueActionProcessor,
  getEventBusActionProcessor,
  getConfigGetSecretActionProcessor,
  getConfigGetParameterActionProcessor,
  getConfigGetParametersActionProcessor,
  getUserDirectoryActionProcessor,
  getWebEntryActionProcessor,
  getServiceFunctionActionProcessor,
  awsLambdaUtils,
  DynamicModuleLoader,
} from 'quidproquo-actionprocessor-awslambda';

import { getConfigActionProcessor } from 'quidproquo-actionprocessor-node';

import { createRuntime, askProcessEvent, QpqRuntimeType } from 'quidproquo-core';

import { Context } from 'aws-lambda';

import { getLambdaConfigs } from './lambdaConfig';
import { ActionProcessorListResolver } from './actionProcessorListResolver';
import { getLogger } from './logger/logger';

// @ts-ignore - Special webpack loader
import { dynamicModuleLoader } from './dynamicModuleLoader';

// @ts-ignore - Special webpack loader
import qpqCustomActionProcessors from 'qpq-custom-action-processors-loader!';

// TODO: Make this a util or something based on server time or something..
const getDateNow = () => new Date().toISOString();

export const getServiceFunctionExecuteEventExecutor = (
  dynamicModuleLoader: DynamicModuleLoader,
  getCustomActionProcessors: ActionProcessorListResolver = () => ({}),
) => {
  return async (event: ExecuteServiceFunctionEvent<any>, context: Context) => {
    const cdkConfig = await getLambdaConfigs();

    // Build a processor for the session and stuff
    // Remove the non route ones ~ let the story execute action add them
    const storyActionProcessor = {
      ...coreActionProcessor,
      ...webserverActionProcessor,

      ...getServiceFunctionExecuteEventActionProcessor(cdkConfig.qpqConfig),

      ...getConfigGetSecretActionProcessor(cdkConfig.qpqConfig),
      ...getConfigGetParameterActionProcessor(cdkConfig.qpqConfig),
      ...getConfigGetParametersActionProcessor(cdkConfig.qpqConfig),
      ...getSystemActionProcessor(dynamicModuleLoader),
      ...getFileActionProcessor(cdkConfig.qpqConfig),
      ...getConfigActionProcessor(cdkConfig.qpqConfig),
      ...getQueueActionProcessor(cdkConfig.qpqConfig),
      ...getEventBusActionProcessor(cdkConfig.qpqConfig),
      ...getUserDirectoryActionProcessor(cdkConfig.qpqConfig),
      ...getWebEntryActionProcessor(cdkConfig.qpqConfig),
      ...getServiceFunctionActionProcessor(cdkConfig.qpqConfig),

      ...getCustomActionProcessors(cdkConfig.qpqConfig),
      ...qpqCustomActionProcessors(),
    };

    const resolveStory = createRuntime(
      {},
      storyActionProcessor,
      getDateNow,
      getLogger(cdkConfig.qpqConfig),
      awsLambdaUtils.randomGuid,
      QpqRuntimeType.SERVICE_FUNCTION_EXE,
    );

    const result = await resolveStory(askProcessEvent, [event, context]);

    // just return the story result
    return result;
  };
};

// Default executor
export const executeServiceFunctionExecuteEvent =
  getServiceFunctionExecuteEventExecutor(dynamicModuleLoader);
