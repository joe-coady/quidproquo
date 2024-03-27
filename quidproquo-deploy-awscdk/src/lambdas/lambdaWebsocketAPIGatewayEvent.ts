import { getWebsocketAPIGatewayEventActionProcessor } from 'quidproquo-actionprocessor-awslambda';

import { createRuntime, askProcessEvent, QpqRuntimeType, QpqLogger } from 'quidproquo-core';

import { CustomMessageTriggerEvent, Context } from 'aws-lambda';

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

export interface EmailPayload {
  username: string;
  code: string;

  userAttributes: Record<string, string>;
  baseDomain: string;
}

export const websocketAPIGatewayEventHandler = async (
  event: CustomMessageTriggerEvent,
  context: Context,
  logger: QpqLogger,
) => {
  const cdkConfig = await getLambdaConfigs();

  // Build a processor for the session and stuff
  // Remove the non route ones ~ let the story execute action add them
  const storyActionProcessor = {
    ...getLambdaActionProcessors(cdkConfig.qpqConfig),
    ...getWebsocketAPIGatewayEventActionProcessor(cdkConfig.qpqConfig),

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
    QpqRuntimeType.WEBSOCKET_EVENT,
  );

  const storyResult = await resolveStory(askProcessEvent, [event, context]);

  return (
    storyResult.result || {
      statusCode: 200,
    }
  );
};

// Default executor
export const executeWebsocketAPIGatewayEvent = qpqFunctionMiddleware(
  websocketAPIGatewayEventHandler,
);
