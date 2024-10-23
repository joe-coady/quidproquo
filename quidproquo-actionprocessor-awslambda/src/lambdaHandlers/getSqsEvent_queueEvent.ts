import { DynamicModuleLoader, QPQConfig, QpqRuntimeType } from 'quidproquo-core';

import { SQSEvent } from 'aws-lambda';

import { getSqsQueueEventProcessor } from '../getActionProcessor';
import { getQpqLambdaRuntimeForEvent } from './helpers/getQpqLambdaRuntimeForEvent';

export const getSqsEvent_queueEvent = (dynamicModuleLoader: DynamicModuleLoader, qpqConfig: QPQConfig) =>
  getQpqLambdaRuntimeForEvent<SQSEvent>(
    QpqRuntimeType.QUEUE_EVENT,
    (event) => {
      return {
        depth: 0,
        context: {},
      };
    },
    getSqsQueueEventProcessor,
    dynamicModuleLoader,
    qpqConfig,
  );
