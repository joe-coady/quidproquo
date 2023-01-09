import { coreActionProcessor, webserverActionProcessor } from 'quidproquo-actionprocessor-node';

import {
  getEventBridgeEventActionProcessor,
  getSystemActionProcessor,
  getFileActionProcessor,
  getConfigGetSecretActionProcessor,
  getConfigGetParameterActionProcessor,
  getConfigGetParametersActionProcessor,
  awsLambdaUtils,
  DynamicModuleLoader,
} from 'quidproquo-actionprocessor-awslambda';
import { createRuntime, askProcessEvent } from 'quidproquo-core';

import { EventBridgeEvent, Context } from 'aws-lambda';

import { lambdaRuntimeConfig, ActionProcessorListResolver } from './lambdaConfig';

// @ts-ignore - Special webpack loader
import qpqDynamicModuleLoader from 'qpq-dynamic-loader!';

// TODO: Make this a util or something based on server time or something..
const getDateNow = () => new Date().toISOString();

export const getEventBridgeEventExecutor = (
  dynamicModuleLoader: DynamicModuleLoader,
  getCustomActionProcessors: ActionProcessorListResolver = () => ({}),
) => {
  return async (event: EventBridgeEvent<string, void>, context: Context) => {
    // Build a processor for the session and stuff
    // Remove the  non event ones
    const storyActionProcessor = {
      ...coreActionProcessor,
      ...webserverActionProcessor,

      ...getEventBridgeEventActionProcessor(lambdaRuntimeConfig),
      ...getSystemActionProcessor(dynamicModuleLoader),
      ...getFileActionProcessor(lambdaRuntimeConfig),
      ...getConfigGetSecretActionProcessor(lambdaRuntimeConfig),
      ...getConfigGetParameterActionProcessor(lambdaRuntimeConfig),
      ...getConfigGetParametersActionProcessor(lambdaRuntimeConfig),

      ...getCustomActionProcessors(lambdaRuntimeConfig),
    };

    const logger = async (result: any) => {};

    // Run the callback
    const resolveStory = createRuntime(
      {},
      storyActionProcessor,
      getDateNow,
      logger,
      awsLambdaUtils.randomGuid,
    );

    await resolveStory(askProcessEvent, [event, context]);
  };
};

export const executeEventBridgeEvent = getEventBridgeEventExecutor(qpqDynamicModuleLoader);
