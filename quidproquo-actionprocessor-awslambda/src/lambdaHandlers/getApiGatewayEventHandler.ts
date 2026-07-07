import { DynamicModuleLoader, QPQConfig, QpqRuntimeType } from 'quidproquo-core';
import { qpqWebServerUtils } from 'quidproquo-webserver';

import { APIGatewayEvent } from 'aws-lambda';

import { getApiGatewayApiEventEventProcessor } from '../getActionProcessor';
import { getQpqLambdaRuntimeForEvent } from './helpers/getQpqLambdaRuntimeForEvent';

export const getApiGatewayEventHandler = (dynamicModuleLoader: DynamicModuleLoader, qpqConfig: QPQConfig) =>
  getQpqLambdaRuntimeForEvent<APIGatewayEvent>(
    QpqRuntimeType.API,
    () => ({
      depth: 0,
      context: {},
    }),
    getApiGatewayApiEventEventProcessor,
    dynamicModuleLoader,
    qpqConfig,
  );
