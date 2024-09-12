import { QpqRuntimeType } from 'quidproquo-core';

import { DefineAuthChallengeTriggerEvent } from 'aws-lambda';

import { getQpqLambdaRuntimeForEvent } from './lambda-utils';
import { getCognitoDefineAuthChallengeEventProcessor } from 'quidproquo-actionprocessor-awslambda';

// Default executor
export const executeLambdaCognitoDefineAuthChallengeTriggerEvent = getQpqLambdaRuntimeForEvent<DefineAuthChallengeTriggerEvent>(
  QpqRuntimeType.AUTH_DEFINE_AUTH_CHALLENGE,
  (event) => {
    return {
      depth: 0,
      context: {},
    };
  },
  getCognitoDefineAuthChallengeEventProcessor,
);
