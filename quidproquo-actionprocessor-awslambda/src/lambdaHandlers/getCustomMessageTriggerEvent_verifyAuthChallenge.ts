import { DynamicModuleLoader, QPQConfig, QpqRuntimeType } from 'quidproquo-core';

import { VerifyAuthChallengeResponseTriggerEvent } from 'aws-lambda';

import { getCognitoVerifyAuthChallengeEventProcessor } from '../getActionProcessor';
import { getQpqLambdaRuntimeForEvent } from './helpers/getQpqLambdaRuntimeForEvent';

export const getCustomMessageTriggerEvent_verifyAuthChallenge = (dynamicModuleLoader: DynamicModuleLoader, qpqConfig: QPQConfig) =>
  getQpqLambdaRuntimeForEvent<VerifyAuthChallengeResponseTriggerEvent>(
    QpqRuntimeType.AUTH_VERIFY_AUTH_CHALLENGE,
    (event) => {
      return {
        depth: 0,
        context: {},
      };
    },
    getCognitoVerifyAuthChallengeEventProcessor,
    dynamicModuleLoader,
    qpqConfig,
  );
