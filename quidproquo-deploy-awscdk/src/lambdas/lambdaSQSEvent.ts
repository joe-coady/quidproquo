import { SQSEvent } from 'aws-lambda';

import { QpqRuntimeType } from 'quidproquo-core';

import { getQpqLambdaRuntimeForEvent } from './lambda-utils';
import { getSqsQueueEventProcessor } from 'quidproquo-actionprocessor-awslambda';

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
);
