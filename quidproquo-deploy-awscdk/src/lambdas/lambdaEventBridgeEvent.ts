import { coreActionProcessor, webserverActionProcessor } from 'quidproquo-actionprocessor-node';

import {
  getEventBridgeEventActionProcessor,
  getSystemActionProcessor,
  getFileActionProcessor,
  getConfigGetSecretActionProcessor,
  getConfigGetParameterActionProcessor,
  awsLambdaUtils,
} from 'quidproquo-actionprocessor-awslambda';
import { createRuntime, askProcessEvent } from 'quidproquo-core';

import { EventBridgeEvent, Context } from 'aws-lambda';

import { lambdaRuntimeConfig, ActionProcessorListResolver } from './lambdaConfig';

// TODO: Make this a util or something based on server time or something..
const getDateNow = () => new Date().toISOString();

export const getEventBridgeEventExecutor = (
  getCustomActionProcessors: ActionProcessorListResolver = () => ({}),
) => {
  return async (event: EventBridgeEvent<string, void>, context: Context) => {
    // Build a processor for the session and stuff
    // Remove the  non event ones
    const storyActionProcessor = {
      ...coreActionProcessor,
      ...webserverActionProcessor,

      ...getEventBridgeEventActionProcessor(lambdaRuntimeConfig),
      ...getSystemActionProcessor(lambdaRuntimeConfig),
      ...getFileActionProcessor(lambdaRuntimeConfig),
      ...getConfigGetSecretActionProcessor(lambdaRuntimeConfig),
      ...getConfigGetParameterActionProcessor(lambdaRuntimeConfig),

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

export const executeEventBridgeEvent = getEventBridgeEventExecutor();
