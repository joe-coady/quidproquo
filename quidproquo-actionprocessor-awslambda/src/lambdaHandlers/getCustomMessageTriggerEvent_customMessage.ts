import { DynamicModuleLoader, QPQConfig, QpqRuntimeType } from 'quidproquo-core';

import { CustomMessageTriggerEvent } from 'aws-lambda';

import { getQpqLambdaRuntimeForEvent } from './helpers/getQpqLambdaRuntimeForEvent';
import { getCognitoCustomMessageEventProcessor } from '../getActionProcessor';

export const getCustomMessageTriggerEvent_customMessage = (dynamicModuleLoader: DynamicModuleLoader, qpqConfig: QPQConfig) =>
  getQpqLambdaRuntimeForEvent<CustomMessageTriggerEvent>(
    QpqRuntimeType.SEND_EMAIL_EVENT,
    (event) => {
      return {
        depth: 0,
        context: {},
      };
    },
    getCognitoCustomMessageEventProcessor,
    dynamicModuleLoader,
    qpqConfig,
  );
