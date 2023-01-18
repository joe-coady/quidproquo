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

import { getLambdaConfigs } from './lambdaConfig';
import { ActionProcessorListResolver } from './actionProcessorListResolver';

// @ts-ignore - Special webpack loader
import qpqDynamicModuleLoader from 'qpq-dynamic-loader!';

// @ts-ignore - Special webpack loader
import qpqCustomActionProcessors from 'qpq-custom-action-processors-loader!';

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
    const cdkConfig = await getLambdaConfigs();

    // Build a processor for the session and stuff
    // Remove the non route ones ~ let the story execute action add them
    const storyActionProcessor = {
      ...coreActionProcessor,
      ...webserverActionProcessor,

      ...getAPIGatewayEventActionProcessor(cdkConfig.qpqConfig),
      ...getConfigGetSecretActionProcessor(cdkConfig.qpqConfig, cdkConfig.awsResourceMap),
      ...getConfigGetParameterActionProcessor(cdkConfig.qpqConfig, cdkConfig.awsResourceMap),
      ...getConfigGetParametersActionProcessor(cdkConfig.qpqConfig, cdkConfig.awsResourceMap),
      ...getSystemActionProcessor(dynamicModuleLoader),
      ...getFileActionProcessor(cdkConfig.qpqConfig, cdkConfig.awsResourceMap),

      ...getCustomActionProcessors(cdkConfig.qpqConfig, cdkConfig.awsResourceMap),
      ...qpqCustomActionProcessors(),
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
      const response = {
        statusCode: result.result.statusCode,
        body: result.result.body,
        headers: result.result.headers,
        isBase64Encoded: result.result.isBase64Encoded,
      };
      return response;
    }

    const code = ErrorTypeHttpResponseMap[result.error.errorType];
    return {
      statusCode: code || 500,
      body: JSON.stringify(result.error),
      headers: qpqWebServerUtils.getCorsHeaders(cdkConfig.qpqConfig, {}, event.headers),
    };
  };
};

// Default executor
export const executeAPIGatewayEvent = getAPIGatewayEventExecutor(qpqDynamicModuleLoader);
