import { SQSEvent } from 'aws-lambda';

import { QpqRuntimeType } from 'quidproquo-core';

import { getQpqConfig } from './lambda-utils';
import { dynamicModuleLoader } from './dynamicModuleLoader';
import { getQpqLambdaRuntimeForEvent } from '../lambdaHandlers/helpers/getQpqLambdaRuntimeForEvent';
import { getSqsQueueEventProcessor } from '../getActionProcessor';

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
