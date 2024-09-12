import { QpqRuntimeType } from 'quidproquo-core';

import { APIGatewayProxyWebsocketEventV2WithRequestContext, APIGatewayEventWebsocketRequestContextV2 } from 'aws-lambda';

import { getQpqLambdaRuntimeForEvent } from './lambda-utils';
import { getApiGatewayWebsocketEventEventProcessor } from 'quidproquo-actionprocessor-awslambda';

type ApiGatwayEventWebsocketWithIdentity = APIGatewayProxyWebsocketEventV2WithRequestContext<
  APIGatewayEventWebsocketRequestContextV2 & { identity: { sourceIp: string; userAgent: string } }
>;

// Default executor
export const executeWebsocketAPIGatewayEvent = getQpqLambdaRuntimeForEvent<ApiGatwayEventWebsocketWithIdentity>(
  QpqRuntimeType.WEBSOCKET_EVENT,
  (event) => {
    return {
      depth: 0,
      context: {},
    };
  },
  getApiGatewayWebsocketEventEventProcessor,
);
