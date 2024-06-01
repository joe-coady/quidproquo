import { QpqRuntimeType } from 'quidproquo-core';
import { qpqWebServerUtils } from 'quidproquo-webserver';
import { getApiGatewayApiEventEventProcessor } from 'quidproquo-actionprocessor-awslambda';
import { APIGatewayEvent } from 'aws-lambda';

import { getQpqLambdaRuntimeForEvent } from './lambda-utils';

// Default executor
export const executeAPIGatewayEvent = getQpqLambdaRuntimeForEvent<APIGatewayEvent>(
  QpqRuntimeType.API,
  (event) => {
    const accessToken = qpqWebServerUtils.getAccessTokenFromHeaders(event.headers);

    return {
      depth: 0,
      accessToken: accessToken,
      context: {},
    };
  },
  (qpqConfig) => getApiGatewayApiEventEventProcessor(qpqConfig),
);
