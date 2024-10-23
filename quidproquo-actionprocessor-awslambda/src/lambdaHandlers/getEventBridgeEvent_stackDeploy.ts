import { EventBridgeEvent } from 'aws-lambda';
import { DynamicModuleLoader, QPQConfig, QpqRuntimeType } from 'quidproquo-core';

import { getEventBridgeStackDeployEventActionProcessor } from '../getActionProcessor';
import { getQpqLambdaRuntimeForEvent } from './helpers/getQpqLambdaRuntimeForEvent';

export const getEventBridgeEvent_stackDeploy = (dynamicModuleLoader: DynamicModuleLoader, qpqConfig: QPQConfig) =>
  getQpqLambdaRuntimeForEvent<EventBridgeEvent<string, void>>(
    QpqRuntimeType.DEPLOY_EVENT,
    (event) => {
      return {
        depth: 0,
        context: {},
      };
    },
    getEventBridgeStackDeployEventActionProcessor,
    dynamicModuleLoader,
    qpqConfig,
  );
