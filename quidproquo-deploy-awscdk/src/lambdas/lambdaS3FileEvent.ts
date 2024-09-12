import { QpqRuntimeType } from 'quidproquo-core';

import { S3Event } from 'aws-lambda';

import { getQpqLambdaRuntimeForEvent } from './lambda-utils';
import { getS3FileEventEventProcessor } from 'quidproquo-actionprocessor-awslambda';

// Default executor
export const executeS3FileEvent = getQpqLambdaRuntimeForEvent<S3Event>(
  QpqRuntimeType.STORAGEDRIVE_EVENT,
  (event) => {
    return {
      depth: 0,
      context: {},
    };
  },
  getS3FileEventEventProcessor,
);
