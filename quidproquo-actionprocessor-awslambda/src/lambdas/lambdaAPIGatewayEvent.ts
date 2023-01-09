import { coreActionProcessor, webserverActionProcessor } from 'quidproquo-actionprocessor-node';

import {
  getAPIGatewayEventActionProcessor,
  getSystemActionProcessor,
  getFileActionProcessor,
  getConfigGetSecretActionProcessor,
  getConfigGetParameterActionProcessor,
  getConfigGetParametersActionProcessor,
  awsLambdaUtils,
  DynamicModuleLoader,
} from 'quidproquo-actionprocessor-awslambda';

import { qpqWebServerUtils } from 'quidproquo-webserver';

import { createRuntime, askProcessEvent, ErrorTypeEnum } from 'quidproquo-core';

import { APIGatewayEvent, Context } from 'aws-lambda';

import { lambdaRuntimeConfig, ActionProcessorListResolver } from './lambdaConfig';

// @ts-ignore - Special webpack loader
import qpqDynamicModuleLoader from 'qpq-dynamic-loader!';

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
  [ErrorTypeEnum.Invalid]: 422,
};

export const getAPIGatewayEventExecutor = (
  dynamicModuleLoader: DynamicModuleLoader,
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
      ...getConfigGetParameterActionProcessor(lambdaRuntimeConfig),
      ...getConfigGetParametersActionProcessor(lambdaRuntimeConfig),
      ...getSystemActionProcessor(dynamicModuleLoader),
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

    // Run the callback
    if (!result.error) {
      return {
        statusCode: result.result.statusCode,
        body: JSON.stringify(result.result.body),
        headers: result.result.headers,
      };
    }

    console.log(JSON.stringify(result));
    const code = ErrorTypeHttpResponseMap[result.error.errorType];
    return {
      statusCode: code || 500,
      body: JSON.stringify(result.error),
      headers: qpqWebServerUtils.getCorsHeaders(lambdaRuntimeConfig.qpqConfig, {}, event.headers),
    };
  };
};

// Default executor
export const executeAPIGatewayEvent = getAPIGatewayEventExecutor(qpqDynamicModuleLoader);
