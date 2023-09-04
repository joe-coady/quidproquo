import {
  getEventBridgeEventActionProcessor,
  DynamicModuleLoader,
  LambdaRuntimeConfig,
} from 'quidproquo-actionprocessor-awslambda';

import { createRuntime, askProcessEvent, QpqRuntimeType } from 'quidproquo-core';

import { EventBridgeEvent, Context } from 'aws-lambda';

import { getLambdaConfigs } from './lambdaConfig';
import { ActionProcessorListResolver } from './actionProcessorListResolver';
import { getLogger, getRuntimeCorrelation, getLambdaActionProcessors } from './lambda-utils';

import { dynamicModuleLoader } from './dynamicModuleLoader';

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
      ...getLambdaActionProcessors(cdkConfig.qpqConfig),
      ...getEventBridgeEventActionProcessor(lambdaRuntimeConfig),

      ...qpqCustomActionProcessors(),
    };

    const resolveStory = createRuntime(
      cdkConfig.qpqConfig,
      {
        depth: 0,
        context: {},
      },
      storyActionProcessor,
      getDateNow,
      getLogger(cdkConfig.qpqConfig),
      getRuntimeCorrelation(cdkConfig.qpqConfig),
      QpqRuntimeType.RECURRING_SCHEDULE,
    );

    await resolveStory(askProcessEvent, [event, context]);
  };
};

export const executeEventBridgeEvent = getEventBridgeEventExecutor(dynamicModuleLoader);
