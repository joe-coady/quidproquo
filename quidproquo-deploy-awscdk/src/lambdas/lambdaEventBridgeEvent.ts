import {
  getEventBridgeEventActionProcessor,
  LambdaRuntimeConfig,
} from 'quidproquo-actionprocessor-awslambda';

import { createRuntime, askProcessEvent, QpqRuntimeType, QpqLogger } from 'quidproquo-core';

import { EventBridgeEvent, Context } from 'aws-lambda';

import { getLambdaConfigs } from './lambdaConfig';

import {
  getLogger,
  getRuntimeCorrelation,
  getLambdaActionProcessors,
  qpqFunctionMiddleware,
} from './lambda-utils';

// @ts-ignore - Special webpack loader
import qpqCustomActionProcessors from 'qpq-custom-action-processors-loader!';

// TODO: Make this a util or something based on server time or something..
const getDateNow = () => new Date().toISOString();

export const eventBridgeEventExecutorHandler = async (
  event: EventBridgeEvent<string, void>,
  context: Context,
  logger: QpqLogger,
) => {
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
    logger,
    getRuntimeCorrelation(cdkConfig.qpqConfig),
    QpqRuntimeType.RECURRING_SCHEDULE,
  );

  await resolveStory(askProcessEvent, [event, context]);
};

export const executeEventBridgeEvent = qpqFunctionMiddleware(eventBridgeEventExecutorHandler);
