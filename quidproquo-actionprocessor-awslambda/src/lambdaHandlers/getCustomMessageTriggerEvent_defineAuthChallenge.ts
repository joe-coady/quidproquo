import { CustomMessageTriggerEvent } from 'aws-lambda';
import { DynamicModuleLoader, QPQConfig, QpqRuntimeType } from 'quidproquo-core';

import { getCognitoDefineAuthChallengeEventProcessor } from '../getActionProcessor';
import { getQpqLambdaRuntimeForEvent } from './helpers/getQpqLambdaRuntimeForEvent';

export const getCustomMessageTriggerEvent_defineAuthChallenge = (dynamicModuleLoader: DynamicModuleLoader, qpqConfig: QPQConfig) =>
  getQpqLambdaRuntimeForEvent<CustomMessageTriggerEvent>(
    QpqRuntimeType.AUTH_DEFINE_AUTH_CHALLENGE,
    (event) => {
      return {
        depth: 0,
        context: {},
      };
    },
    getCognitoDefineAuthChallengeEventProcessor,
    dynamicModuleLoader,
    qpqConfig,
  );
