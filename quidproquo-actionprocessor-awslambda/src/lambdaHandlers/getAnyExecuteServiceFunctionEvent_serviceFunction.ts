import { ExecuteServiceFunctionEvent } from 'quidproquo-webserver';

import { DynamicModuleLoader, QPQConfig, QpqRuntimeType, StorySession } from 'quidproquo-core';
import { getQpqLambdaRuntimeForEvent } from './helpers/getQpqLambdaRuntimeForEvent';
import { getLambdaServiceFunctionEventProcessor } from '../getActionProcessor';

// TODO: Unify this once the lambda code moves from CDK to awslambda
type AnyExecuteServiceFunctionEventWithSession = ExecuteServiceFunctionEvent<any[]> & {
  storySession: StorySession;
};

export const getAnyExecuteServiceFunctionEvent_serviceFunction = (dynamicModuleLoader: DynamicModuleLoader, qpqConfig: QPQConfig) =>
  getQpqLambdaRuntimeForEvent<AnyExecuteServiceFunctionEventWithSession>(
    QpqRuntimeType.SERVICE_FUNCTION_EXE,
    (event) => {
      return event.storySession;
    },
    getLambdaServiceFunctionEventProcessor,
    dynamicModuleLoader,
    qpqConfig,
  );
