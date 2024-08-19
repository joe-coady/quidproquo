import { QpqRuntimeType } from 'quidproquo-core';

import { CreateAuthChallengeTriggerEvent } from 'aws-lambda';

import { getQpqLambdaRuntimeForEvent } from './lambda-utils';
import { getCognitoCreateAuthChallengeEventProcessor } from 'quidproquo-actionprocessor-awslambda';

// Default executor
export const executeLambdaCognitoCreateAuthChallengeTriggerEvent = getQpqLambdaRuntimeForEvent<CreateAuthChallengeTriggerEvent>(
  QpqRuntimeType.AUTH_CREATE_AUTH_CHALLENGE,
  (event) => {
    return {
      depth: 0,
      context: {},
    };
  },
  (qpqConfig) => getCognitoCreateAuthChallengeEventProcessor(qpqConfig),
);
