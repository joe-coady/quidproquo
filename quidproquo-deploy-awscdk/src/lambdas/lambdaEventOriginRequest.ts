import { QpqRuntimeType } from 'quidproquo-core';
import { CloudFrontRequestEvent } from 'aws-lambda';
import { getQpqLambdaRuntimeForEvent } from './lambda-utils';
import { getCloudFrontOriginRequestEventProcessor } from 'quidproquo-actionprocessor-awslambda';

// Default executor
export const executeEventOriginRequest = getQpqLambdaRuntimeForEvent<CloudFrontRequestEvent>(
  QpqRuntimeType.EVENT_SEO_OR,
  (event) => {
    return {
      depth: 0,
      context: {},
    };
  },
  (qpqConfig) => getCloudFrontOriginRequestEventProcessor(qpqConfig),
);
