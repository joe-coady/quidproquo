import { getEventBridgeEventStackDeployActionProcessor } from 'quidproquo-actionprocessor-awslambda';

import { QpqRuntimeType } from 'quidproquo-core';

import { EventBridgeEvent, Context } from 'aws-lambda';

import { getQpqLambdaRuntimeForEvent } from './lambda-utils';

export const executelambdaEventBridgeEventStackDeploy = getQpqLambdaRuntimeForEvent<EventBridgeEvent<string, void>>(
  QpqRuntimeType.DEPLOY_EVENT,
  (event) => {
    return {
      depth: 0,
      context: {},
    };
  },
  (qpqConfig) => getEventBridgeEventStackDeployActionProcessor(qpqConfig),
);
