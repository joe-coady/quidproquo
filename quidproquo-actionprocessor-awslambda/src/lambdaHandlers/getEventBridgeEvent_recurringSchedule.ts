import { DynamicModuleLoader, QPQConfig, QpqRuntimeType } from 'quidproquo-core';

import { EventBridgeEvent } from 'aws-lambda';
import { getQpqLambdaRuntimeForEvent } from './helpers/getQpqLambdaRuntimeForEvent';
import { getEventBridgeEventActionProcessor } from '../getActionProcessor';

export const getEventBridgeEvent_recurringSchedule = (dynamicModuleLoader: DynamicModuleLoader, qpqConfig: QPQConfig) =>
  getQpqLambdaRuntimeForEvent<EventBridgeEvent<string, void>>(
    QpqRuntimeType.RECURRING_SCHEDULE,
    (event) => {
      return {
        depth: 0,
        context: {},
      };
    },
    // TODO: rename this.
    getEventBridgeEventActionProcessor,
    dynamicModuleLoader,
    qpqConfig,
  );
