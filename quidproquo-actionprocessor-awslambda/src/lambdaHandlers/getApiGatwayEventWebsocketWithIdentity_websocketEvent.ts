import { DynamicModuleLoader, QPQConfig, QpqRuntimeType } from 'quidproquo-core';

import { APIGatewayEventWebsocketRequestContextV2,APIGatewayProxyWebsocketEventV2WithRequestContext } from 'aws-lambda';

import { getApiGatewayWebsocketEventEventProcessor } from '../getActionProcessor';
import { getQpqLambdaRuntimeForEvent } from './helpers/getQpqLambdaRuntimeForEvent';

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
