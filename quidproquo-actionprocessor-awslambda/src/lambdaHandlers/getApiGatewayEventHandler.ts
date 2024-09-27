import { DynamicModuleLoader, QPQConfig, QpqRuntimeType } from 'quidproquo-core';
import { qpqWebServerUtils } from 'quidproquo-webserver';
import { getApiGatewayApiEventEventProcessor } from '../getActionProcessor';
import { APIGatewayEvent } from 'aws-lambda';

import { getQpqLambdaRuntimeForEvent } from './helpers/getQpqLambdaRuntimeForEvent';

export const getApiGatewayEventHandler = (dynamicModuleLoader: DynamicModuleLoader, qpqConfig: QPQConfig) =>
  getQpqLambdaRuntimeForEvent<APIGatewayEvent>(
    QpqRuntimeType.API,
    (event) => {
      console.log('event', JSON.stringify(event, null, 2));
      console.log(event);

      const accessToken = qpqWebServerUtils.getAccessTokenFromHeaders(event.headers);

      return {
        depth: 0,
        accessToken: accessToken,
        context: {},
      };
    },
    getApiGatewayApiEventEventProcessor,
    dynamicModuleLoader,
    qpqConfig,
  );
