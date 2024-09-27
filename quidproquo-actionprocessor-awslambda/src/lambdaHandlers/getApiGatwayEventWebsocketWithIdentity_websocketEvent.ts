import { DynamicModuleLoader, QPQConfig, QpqRuntimeType } from 'quidproquo-core';

import { APIGatewayProxyWebsocketEventV2WithRequestContext, APIGatewayEventWebsocketRequestContextV2 } from 'aws-lambda';

import { getQpqLambdaRuntimeForEvent } from './helpers/getQpqLambdaRuntimeForEvent';
import { getApiGatewayWebsocketEventEventProcessor } from '../getActionProcessor';

// TODO: Move this type to one place
type ApiGatwayEventWebsocketWithIdentity = APIGatewayProxyWebsocketEventV2WithRequestContext<
  APIGatewayEventWebsocketRequestContextV2 & {
    identity: { sourceIp: string; userAgent: string };
  }
>;

export const getApiGatwayEventWebsocketWithIdentity_websocketEvent = (dynamicModuleLoader: DynamicModuleLoader, qpqConfig: QPQConfig) =>
  getQpqLambdaRuntimeForEvent<ApiGatwayEventWebsocketWithIdentity>(
    QpqRuntimeType.WEBSOCKET_EVENT,
    (event) => {
      return {
        depth: 0,
        context: {},
      };
    },
    getApiGatewayWebsocketEventEventProcessor,
    dynamicModuleLoader,
    qpqConfig,
  );
