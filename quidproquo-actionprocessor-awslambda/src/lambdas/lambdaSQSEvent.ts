import { SQSEvent } from 'aws-lambda';
import { QpqRuntimeType } from 'quidproquo-core';

import { getSqsQueueEventProcessor } from '../getActionProcessor';
import { getQpqLambdaRuntimeForEvent } from '../lambdaHandlers/helpers/getQpqLambdaRuntimeForEvent';
import { dynamicModuleLoader } from './dynamicModuleLoader';
import { getQpqConfig } from './lambda-utils';

// Default executor
export const executeSQSEvent = getQpqLambdaRuntimeForEvent<SQSEvent>(
  QpqRuntimeType.QUEUE_EVENT,
  (event) => {
    return {
      depth: 0,
      context: {},
    };
  },
  getSqsQueueEventProcessor,
  dynamicModuleLoader,
  getQpqConfig(),
);
