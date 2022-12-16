import { coreActionProcessor, webserverActionProcessor } from 'quidproquo-actionprocessor-node';

import {
  getAPIGatewayEventActionProcessor,
  getSystemActionProcessor,
  getFileActionProcessor,
  getConfigGetSecretActionProcessor,
  awsLambdaUtils,
} from 'quidproquo-actionprocessor-awslambda';

import { createRuntime, askProcessEvent, ErrorTypeEnum } from 'quidproquo-core';

import { APIGatewayEvent, Context } from 'aws-lambda';

import { lambdaRuntimeConfig, ActionProcessorListResolver } from './lambdaConfig';

// TODO: Make this a util or something based on server time or something..
const getDateNow = () => new Date().toISOString();

const ErrorTypeHttpResponseMap = {
  [ErrorTypeEnum.BadRequest]: 400,
  [ErrorTypeEnum.Unauthorized]: 401,
  [ErrorTypeEnum.PaymentRequired]: 402,
  [ErrorTypeEnum.Forbidden]: 403,
  [ErrorTypeEnum.NotFound]: 404,
  [ErrorTypeEnum.TimeOut]: 408,
  [ErrorTypeEnum.UnsupportedMediaType]: 415,
  [ErrorTypeEnum.OutOfResources]: 500,
  [ErrorTypeEnum.GenericError]: 500,
  [ErrorTypeEnum.NotImplemented]: 501,
  [ErrorTypeEnum.NoContent]: 204,
};

export const getAPIGatewayEventExecutor = (
  getCustomActionProcessors: ActionProcessorListResolver = () => ({}),
) => {
  return async (event: APIGatewayEvent, context: Context) => {
    // Build a processor for the session and stuff
    // Remove the non route ones ~ let the story execute action add them
    const storyActionProcessor = {
      ...coreActionProcessor,
      ...webserverActionProcessor,

      ...getAPIGatewayEventActionProcessor(lambdaRuntimeConfig.qpqConfig),
      ...getConfigGetSecretActionProcessor(lambdaRuntimeConfig),
      ...getSystemActionProcessor(lambdaRuntimeConfig),
      ...getFileActionProcessor(lambdaRuntimeConfig),

      ...getCustomActionProcessors(lambdaRuntimeConfig),
    };

    const logger = async (result: any) => {
      // addResult(
      //   envConfig.appName,
      //   getDateNow(),
      //   doWeCarePath,
      //   "route-infrastructure",
      //   "infrastructure",
      //   "askRoute",
      //   result
      // );
    };

    //   // Run the callback

    const resolveStory = createRuntime(
      {},
      storyActionProcessor,
      getDateNow,
      logger,
      awsLambdaUtils.randomGuid,
    );

    const result = await resolveStory(askProcessEvent, [event, context]);

    // // Run the callback
    if (!result.error) {
      return {
        statusCode: result.result.statusCode,
        body: JSON.stringify(result.result.body),
        headers: result.result.headers,
      };
    }

    const code = ErrorTypeHttpResponseMap[result.error.errorType];
    return {
      statusCode: code || 500,
      body: JSON.stringify(result.error),
      headers: {},
    };
  };
};

// Default executor
export const executeAPIGatewayEvent = getAPIGatewayEventExecutor();
