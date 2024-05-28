import { QpqRuntimeType } from 'quidproquo-core';

import { EventBridgeEvent } from 'aws-lambda';

import { getQpqLambdaRuntimeForEvent } from './lambda-utils';
import { getEventBridgeStackDeployEventActionProcessor } from 'quidproquo-actionprocessor-awslambda';

export const executelambdaEventBridgeEventStackDeploy = getQpqLambdaRuntimeForEvent<EventBridgeEvent<string, void>>(
  QpqRuntimeType.DEPLOY_EVENT,
  (event) => {
    return {
      depth: 0,
      context: {},
    };
  },
  (qpqConfig) => getEventBridgeStackDeployEventActionProcessor(qpqConfig),
);
