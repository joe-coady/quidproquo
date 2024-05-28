import { QpqRuntimeType } from 'quidproquo-core';

import { CustomMessageTriggerEvent, Context } from 'aws-lambda';

import { getQpqLambdaRuntimeForEvent } from './lambda-utils';
import { getcognitoCustomMessageEventProcessor } from 'quidproquo-actionprocessor-awslambda';

// Default executor
export const executeLambdaCognitoCustomMessageTriggerEvent = getQpqLambdaRuntimeForEvent<CustomMessageTriggerEvent>(
  QpqRuntimeType.SEND_EMAIL_EVENT,
  (event) => {
    return {
      depth: 0,
      context: {},
    };
  },
  (qpqConfig) => getcognitoCustomMessageEventProcessor(qpqConfig),
);
