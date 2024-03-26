import { getEventBridgeEventStackDeployActionProcessor } from 'quidproquo-actionprocessor-awslambda';

import { createRuntime, askProcessEvent, QpqRuntimeType, QpqLogger } from 'quidproquo-core';

import { EventBridgeEvent, Context } from 'aws-lambda';

import { getLambdaConfigs } from './lambdaConfig';

import {
  getRuntimeCorrelation,
  getLambdaActionProcessors,
  qpqFunctionMiddleware,
} from './lambda-utils';

import { dynamicModuleLoader } from './dynamicModuleLoader';

// @ts-ignore - Special webpack loader
import qpqCustomActionProcessors from 'qpq-custom-action-processors-loader!';

// TODO: Make this a util or something based on server time or something..
const getDateNow = () => new Date().toISOString();

export const lambdaEventBridgeEventStackDeployExecutorHandler = async (
  event: EventBridgeEvent<'CloudFormation Stack Status Change', any>,
  context: Context,
  logger: QpqLogger,
): Promise<void> => {
  console.log('EventBridgeEvent: ~ ', JSON.stringify(event, null, 2));

  const cdkConfig = await getLambdaConfigs();

  // Build a processor for the session and stuff
  // Remove the  non event ones
  const storyActionProcessor = {
    ...getLambdaActionProcessors(cdkConfig.qpqConfig),
    ...getEventBridgeEventStackDeployActionProcessor(cdkConfig.qpqConfig),

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
    QpqRuntimeType.DEPLOY_EVENT,
  );

  await resolveStory(askProcessEvent, [event, context]);
};

export const executelambdaEventBridgeEventStackDeploy = qpqFunctionMiddleware(
  lambdaEventBridgeEventStackDeployExecutorHandler,
);
