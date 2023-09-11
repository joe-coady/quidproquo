import {
  DynamicModuleLoader,
  LambdaRuntimeConfig,
  getEventBridgeEventStackDeployActionProcessor
} from 'quidproquo-actionprocessor-awslambda';

import { createRuntime, askProcessEvent, QpqRuntimeType } from 'quidproquo-core';

import { EventBridgeEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

import { getLambdaConfigs } from './lambdaConfig';
import { ActionProcessorListResolver } from './actionProcessorListResolver';
import { getLogger, getRuntimeCorrelation, getLambdaActionProcessors } from './lambda-utils';

import { dynamicModuleLoader } from './dynamicModuleLoader';

// @ts-ignore - Special webpack loader
import qpqCustomActionProcessors from 'qpq-custom-action-processors-loader!';

// TODO: Make this a util or something based on server time or something..
const getDateNow = () => new Date().toISOString();

export const getlambdaEventBridgeEventStackDeployExecutor = (
  dynamicModuleLoader: DynamicModuleLoader,
  getCustomActionProcessors: ActionProcessorListResolver = () => ({}),
) => {
  return async (event: EventBridgeEvent<"CloudFormation Stack Status Change", any>, context: Context): Promise<void> => {
    console.log("EventBridgeEvent: ~ ", JSON.stringify(event, null, 2));

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
      getLogger(cdkConfig.qpqConfig),
      getRuntimeCorrelation(cdkConfig.qpqConfig),
      QpqRuntimeType.DEPLOY_EVENT,
    );

    await resolveStory(askProcessEvent, [event, context]);
  };
};

export const executelambdaEventBridgeEventStackDeploy = getlambdaEventBridgeEventStackDeployExecutor(dynamicModuleLoader);
