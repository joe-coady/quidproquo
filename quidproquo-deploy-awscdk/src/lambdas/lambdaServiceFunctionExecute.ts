import { ExecuteServiceFunctionEvent } from 'quidproquo-webserver';

import { getServiceFunctionExecuteEventActionProcessor } from 'quidproquo-actionprocessor-awslambda';

import { createRuntime, askProcessEvent, QpqRuntimeType, StorySession } from 'quidproquo-core';

import { Context } from 'aws-lambda';

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

// TODO: Unify this once the lambda code moves from CDK to awslambda
type AnyExecuteServiceFunctionEventWithSession = ExecuteServiceFunctionEvent<any[]> & {
  storySession: StorySession;
};

export const serviceFunctionExecuteEventHandler = async (
  event: AnyExecuteServiceFunctionEventWithSession,
  context: Context,
) => {
  const cdkConfig = await getLambdaConfigs();

  // Build a processor for the session and stuff
  // Remove the non route ones ~ let the story execute action add them
  const storyActionProcessor = {
    ...getLambdaActionProcessors(cdkConfig.qpqConfig),
    ...getServiceFunctionExecuteEventActionProcessor(cdkConfig.qpqConfig),

    ...qpqCustomActionProcessors(),
  };

  const resolveStory = createRuntime(
    cdkConfig.qpqConfig,
    event.storySession,
    storyActionProcessor,
    getDateNow,
    getLogger(cdkConfig.qpqConfig),
    getRuntimeCorrelation(cdkConfig.qpqConfig),
    QpqRuntimeType.SERVICE_FUNCTION_EXE,
  );

  const eventWithNoSession: ExecuteServiceFunctionEvent<any[]> = {
    functionName: event.functionName,
    payload: event.payload,
  };

  const result = await resolveStory(askProcessEvent, [eventWithNoSession, context]);

  // just return the story result
  return result;
};

// Default executor
export const executeServiceFunctionExecuteEvent = qpqFunctionMiddleware(
  serviceFunctionExecuteEventHandler,
);
