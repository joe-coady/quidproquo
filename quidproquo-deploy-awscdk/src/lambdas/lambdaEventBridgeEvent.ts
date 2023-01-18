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
  LambdaRuntimeConfig,
} from 'quidproquo-actionprocessor-awslambda';
import { createRuntime, askProcessEvent } from 'quidproquo-core';

import { EventBridgeEvent, Context } from 'aws-lambda';

import { getLambdaConfigs } from './lambdaConfig';
import { ActionProcessorListResolver } from './actionProcessorListResolver';

// @ts-ignore - Special webpack loader
import qpqDynamicModuleLoader from 'qpq-dynamic-loader!';

// @ts-ignore - Special webpack loader
import qpqCustomActionProcessors from 'qpq-custom-action-processors-loader!';

// TODO: Make this a util or something based on server time or something..
const getDateNow = () => new Date().toISOString();

export const getEventBridgeEventExecutor = (
  dynamicModuleLoader: DynamicModuleLoader,
  getCustomActionProcessors: ActionProcessorListResolver = () => ({}),
) => {
  return async (event: EventBridgeEvent<string, void>, context: Context) => {
    const cdkConfig = await getLambdaConfigs();

    const lambdaRuntimeConfig: LambdaRuntimeConfig = JSON.parse(
      process.env.lambdaRuntimeConfig || '{}',
    );

    // Build a processor for the session and stuff
    // Remove the  non event ones
    const storyActionProcessor = {
      ...coreActionProcessor,
      ...webserverActionProcessor,

      ...getEventBridgeEventActionProcessor(lambdaRuntimeConfig),
      ...getSystemActionProcessor(dynamicModuleLoader),
      ...getFileActionProcessor(cdkConfig.qpqConfig, cdkConfig.awsResourceMap),
      ...getConfigGetSecretActionProcessor(cdkConfig.qpqConfig, cdkConfig.awsResourceMap),
      ...getConfigGetParameterActionProcessor(cdkConfig.qpqConfig, cdkConfig.awsResourceMap),
      ...getConfigGetParametersActionProcessor(cdkConfig.qpqConfig, cdkConfig.awsResourceMap),

      ...getCustomActionProcessors(cdkConfig.qpqConfig, cdkConfig.awsResourceMap),
      ...qpqCustomActionProcessors(),
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
