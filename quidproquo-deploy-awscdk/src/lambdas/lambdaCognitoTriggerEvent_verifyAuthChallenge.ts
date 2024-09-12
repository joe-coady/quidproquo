import { QpqRuntimeType } from 'quidproquo-core';

import { VerifyAuthChallengeResponseTriggerEvent } from 'aws-lambda';

import { getQpqLambdaRuntimeForEvent } from './lambda-utils';
import { getCognitoVerifyAuthChallengeEventProcessor } from 'quidproquo-actionprocessor-awslambda';

// Default executor
export const executeLambdaCognitoVerifyAuthChallengeTriggerEvent = getQpqLambdaRuntimeForEvent<VerifyAuthChallengeResponseTriggerEvent>(
  QpqRuntimeType.AUTH_VERIFY_AUTH_CHALLENGE,
  (event) => {
    return {
      depth: 0,
      context: {},
    };
  },
  getCognitoVerifyAuthChallengeEventProcessor,
);
