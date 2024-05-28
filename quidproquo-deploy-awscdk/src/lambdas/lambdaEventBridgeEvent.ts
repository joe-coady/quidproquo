import { getEventBridgeEventActionProcessor } from 'quidproquo-actionprocessor-awslambda';

import { QpqRuntimeType } from 'quidproquo-core';

import { EventBridgeEvent, Context } from 'aws-lambda';

import { getQpqLambdaRuntimeForEvent } from './lambda-utils';

export const executeEventBridgeEvent = getQpqLambdaRuntimeForEvent<EventBridgeEvent<string, void>>(
  QpqRuntimeType.RECURRING_SCHEDULE,
  (event) => {
    return {
      depth: 0,
      context: {},
    };
  },
  (qpqConfig) => getEventBridgeEventActionProcessor(qpqConfig),
);
