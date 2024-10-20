import { randomUUID } from 'crypto';
import { askProcessEvent, createRuntime, DynamicModuleLoader, ErrorTypeEnum, QPQConfig, qpqCoreUtils, QpqRuntimeType } from 'quidproquo-core';
import { qpqWebServerUtils } from 'quidproquo-webserver';
import { getAwsActionProcessors, getLogger } from 'quidproquo-actionprocessor-awslambda';
import { getCustomActionActionProcessor } from 'quidproquo-actionprocessor-node';

import { ExpressEvent, ExpressEventResponse } from '../types';
import { getExpressApiEventEventProcessor } from '../getActionProcessor';
import { getGraphDatabaseActionProcessor } from '../actionProcessor';

// TODO: Make this a util or something based on server time or something..
const getDateNow = () => new Date().toISOString();

const ErrorTypeHttpResponseMap: Record<string, number> = {
  [ErrorTypeEnum.BadRequest]: 400,
  [ErrorTypeEnum.Unauthorized]: 401,
  [ErrorTypeEnum.PaymentRequired]: 402,
  [ErrorTypeEnum.Forbidden]: 403,
  [ErrorTypeEnum.NotFound]: 404,
  [ErrorTypeEnum.TimeOut]: 408,
  [ErrorTypeEnum.Conflict]: 409,
  [ErrorTypeEnum.UnsupportedMediaType]: 415,
  [ErrorTypeEnum.OutOfResources]: 500,
  [ErrorTypeEnum.GenericError]: 500,
  [ErrorTypeEnum.NotImplemented]: 501,
  [ErrorTypeEnum.NoContent]: 204,
  [ErrorTypeEnum.Invalid]: 422,
};

export const route = async (
  expressEvent: ExpressEvent,
  qpqConfig: QPQConfig,
  dynamicModuleLoader: DynamicModuleLoader,
): Promise<ExpressEventResponse> => {
  const serviceName = qpqCoreUtils.getApplicationModuleName(qpqConfig);
  const resolveStory = createRuntime(
    qpqConfig,
    {
      depth: 0,
      accessToken: qpqWebServerUtils.getAccessTokenFromHeaders(expressEvent.headers),
      context: {},
    },
    async () => ({
      ...(await getAwsActionProcessors(qpqConfig, dynamicModuleLoader)),
      ...(await getExpressApiEventEventProcessor(qpqConfig, dynamicModuleLoader)),
      ...(await getGraphDatabaseActionProcessor(qpqConfig, dynamicModuleLoader)),

      // Always done last, so they can ovveride the default ones if the user wants.
      ...(await getCustomActionActionProcessor(qpqConfig, dynamicModuleLoader)),
    }),
    getDateNow,
    getLogger(qpqConfig),
    `${serviceName}::${randomUUID()}`,
    QpqRuntimeType.API,
    dynamicModuleLoader,
    [],
  );

  const result = await resolveStory(askProcessEvent, [expressEvent]);

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
    headers: {
      'Content-Type': 'application/json',
    },
    isBase64Encoded: false,
  };
};
