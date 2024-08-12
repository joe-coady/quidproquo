import { QpqRuntimeType } from 'quidproquo-core';

import { CustomMessageTriggerEvent } from 'aws-lambda';

import { getQpqLambdaRuntimeForEvent } from './lambda-utils';
import { getCognitoCustomMessageEventProcessor } from 'quidproquo-actionprocessor-awslambda';

// Default executor
export const executeLambdaCognitoCustomMessageTriggerEvent = getQpqLambdaRuntimeForEvent<CustomMessageTriggerEvent>(
  QpqRuntimeType.SEND_EMAIL_EVENT,
  (event) => {
    return {
      depth: 0,
      context: {},
    };
  },
  (qpqConfig) => getCognitoCustomMessageEventProcessor(qpqConfig),
);
