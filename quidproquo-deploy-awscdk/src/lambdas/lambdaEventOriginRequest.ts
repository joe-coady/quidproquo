import { coreActionProcessor, webserverActionProcessor } from 'quidproquo-actionprocessor-node';

import {
  getCloudFrontOriginRequestEventActionProcessor,
  getSystemActionProcessor,
  getFileActionProcessor,
  getConfigGetSecretActionProcessor,
  getConfigGetParameterActionProcessor,
  getConfigGetParametersActionProcessor,
  awsLambdaUtils,
  QPQAWSLambdaConfig,
  DynamicModuleLoader,
  getParameter,
} from 'quidproquo-actionprocessor-awslambda';

import { qpqWebServerUtils } from 'quidproquo-webserver';

import { createRuntime, askProcessEvent, ErrorTypeEnum, qpqCoreUtils } from 'quidproquo-core';

import { CloudFrontRequestEvent, Context } from 'aws-lambda';

import { ActionProcessorListResolver } from './actionProcessorListResolver';

// @ts-ignore - Special webpack loader
import qpqDynamicModuleLoader from 'qpq-dynamic-loader!';

// @ts-ignore - Special webpack loader
import qpqConfig from 'qpq-config-loader!';

// TODO: Make this a util or something based on server time or something..
const getDateNow = () => new Date().toISOString();

export const getOriginRequestEventExecutor = (
  dynamicModuleLoader: DynamicModuleLoader,
  getCustomActionProcessors: ActionProcessorListResolver = () => ({}),
) => {
  return async (event: CloudFrontRequestEvent, context: Context) => {
    // Don't run the lambda if we are not a bot
    if (event.Records[0].cf.request.headers['x-qpq-is-bot'][0].value !== 'true') {
      return event.Records[0].cf.request;
    }

    // TODO: Make this error safe
    const service = qpqCoreUtils.getAppName(qpqConfig);
    const environment = qpqCoreUtils.getAppFeature(qpqConfig);
    const param = await getParameter(
      `qpqRuntimeConfig-${service}-${environment}`,
      qpqWebServerUtils.getDeployRegion(qpqConfig),
    );
    const lambdaRuntimeConfig: QPQAWSLambdaConfig = JSON.parse(param);
    // //////////////////////////

    // Build a processor for the session and stuff
    // Remove the non route ones ~ let the story execute action add them
    const storyActionProcessor = {
      ...coreActionProcessor,
      ...webserverActionProcessor,

      ...getCloudFrontOriginRequestEventActionProcessor(lambdaRuntimeConfig.qpqConfig),
      ...getConfigGetSecretActionProcessor(lambdaRuntimeConfig),
      ...getConfigGetParameterActionProcessor(lambdaRuntimeConfig),
      ...getConfigGetParametersActionProcessor(lambdaRuntimeConfig),
      ...getSystemActionProcessor(dynamicModuleLoader),
      ...getFileActionProcessor(lambdaRuntimeConfig),

      ...getCustomActionProcessors(lambdaRuntimeConfig),
    };

    const logger = async (result: any) => {};

    // Run the callback

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
      // TODO: Get typing to work here.
      if (result.result.fallbackToCDN) {
        // to forward the result to the origin, just return the request
        // it has the origin details.
        return event.Records[0].cf.request;
      }

      const headers = result.result.headers || {};
      const responseHeaders = Object.keys(headers).reduce(
        (acc, header) => ({ ...acc, [header]: [{ value: headers[header] }] }),
        {},
      );

      return {
        status: `${result.result.status}`,
        statusDescription: 'OK',
        body: result.result.body,
        headers: responseHeaders,
      };
    }

    // CloudFront seems to throw an error when you send back a 404 or something, so we will just hit the normal origin
    return event.Records[0].cf.request;

    // const code = ErrorTypeHttpResponseMap[result.error.errorType];
    // return {
    //   statusCode: code || 500,
    //   statusDescription: result.error.errorType,
    //   body: JSON.stringify(result.error),
    //   headers: {},
    // };
  };
};

// Default executor
export const executeEventOriginRequest = getOriginRequestEventExecutor(qpqDynamicModuleLoader);
