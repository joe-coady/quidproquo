import { getCloudFrontOriginRequestEventActionProcessor } from 'quidproquo-actionprocessor-awslambda';

import { getLambdaConfigs } from './lambdaConfig';

import { createRuntime, askProcessEvent, QpqRuntimeType, QpqLogger } from 'quidproquo-core';

import { CloudFrontRequestEvent, CloudFrontRequestResult, Context } from 'aws-lambda';

import {
  getRuntimeCorrelation,
  getLambdaActionProcessors,
  qpqFunctionMiddleware,
} from './lambda-utils';

// @ts-ignore - Special webpack loader
import qpqCustomActionProcessors from 'qpq-custom-action-processors-loader!';

// TODO: Make this a util or something based on server time or something..
const getDateNow = () => new Date().toISOString();

export const originRequestEventHandler = async (
  event: CloudFrontRequestEvent,
  context: Context,
  logger: QpqLogger,
) => {
  console.log(JSON.stringify(event));

  const cdkConfig = await getLambdaConfigs();

  // Build a processor for the session and stuff
  // Remove the non route ones ~ let the story execute action add them
  const storyActionProcessor = {
    ...getLambdaActionProcessors(cdkConfig.qpqConfig),
    ...getCloudFrontOriginRequestEventActionProcessor(cdkConfig.qpqConfig),

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
    QpqRuntimeType.EVENT_SEO_OR,
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
      bodyEncoding: result.result.bodyEncoding,
    } as CloudFrontRequestResult;
  }

  // CloudFront seems to throw an error when you send back a 404 or something, so we will just hit the normal origin
  return event.Records[0].cf.request;

  /*return {
    status: `200`,
    statusDescription: 'OK',
    body: `<pre>${JSON.stringify(result.error, null, 2)}</pre>`,
  } as CloudFrontRequestResult;*/

  // const code = ErrorTypeHttpResponseMap[result.error.errorType];
  // return {
  //   statusCode: code || 500,
  //   statusDescription: result.error.errorType,
  //   body: JSON.stringify(result.error),
  //   headers: {},
  // };
};

// Default executor
export const executeEventOriginRequest = qpqFunctionMiddleware(originRequestEventHandler);
