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

import { lambdaRuntimeConfig } from './lambdaConfig';

export const getDateNow = () => new Date().toISOString();

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

export const execute = async (event: APIGatewayEvent, context: Context) => {
  // Build a processor for the session and stuff
  // Remove the non route ones ~ let the story execute action add them
  const storyActionProcessor = {
    ...coreActionProcessor,
    ...webserverActionProcessor,

    ...getAPIGatewayEventActionProcessor(lambdaRuntimeConfig.qpqConfig),
    ...getConfigGetSecretActionProcessor(lambdaRuntimeConfig),
    ...getSystemActionProcessor(lambdaRuntimeConfig),
    ...getFileActionProcessor(lambdaRuntimeConfig),
  };

  // const doWeCarePath = (event.path || "").replace(
  //   new RegExp(`^(\/${envConfig.appName})/`),
  //   "/"
  // );

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
      body: JSON.stringify(result.error ? result.error : result.result.body),
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
