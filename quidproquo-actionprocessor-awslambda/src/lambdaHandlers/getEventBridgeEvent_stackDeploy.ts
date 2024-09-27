import { DynamicModuleLoader, QPQConfig, QpqRuntimeType } from 'quidproquo-core';

import { EventBridgeEvent } from 'aws-lambda';
import { getQpqLambdaRuntimeForEvent } from './helpers/getQpqLambdaRuntimeForEvent';
import { getEventBridgeStackDeployEventActionProcessor } from '../getActionProcessor';

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
