import { CustomMessageTriggerEvent } from 'aws-lambda';
import { DynamicModuleLoader, QPQConfig, QpqRuntimeType } from 'quidproquo-core';

import { getCognitoCreateAuthChallengeEventProcessor } from '../getActionProcessor';
import { getQpqLambdaRuntimeForEvent } from './helpers/getQpqLambdaRuntimeForEvent';

export const getCustomMessageTriggerEvent_createAuthChallenge = (dynamicModuleLoader: DynamicModuleLoader, qpqConfig: QPQConfig) =>
  getQpqLambdaRuntimeForEvent<CustomMessageTriggerEvent>(
    QpqRuntimeType.AUTH_CREATE_AUTH_CHALLENGE,
    (event) => {
      return {
        depth: 0,
        context: {},
      };
    },
    getCognitoCreateAuthChallengeEventProcessor,
    dynamicModuleLoader,
    qpqConfig,
  );
