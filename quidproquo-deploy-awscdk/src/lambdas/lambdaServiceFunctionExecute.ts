import { ExecuteServiceFunctionEvent } from 'quidproquo-webserver';

import { QpqRuntimeType, StorySession } from 'quidproquo-core';

import { getQpqLambdaRuntimeForEvent } from './lambda-utils';
import { getS3FileEventEventProcessor } from 'quidproquo-actionprocessor-awslambda';

// TODO: Unify this once the lambda code moves from CDK to awslambda
type AnyExecuteServiceFunctionEventWithSession = ExecuteServiceFunctionEvent<any[]> & {
  storySession: StorySession;
};

// Default executor
export const executeServiceFunctionExecuteEvent = getQpqLambdaRuntimeForEvent<AnyExecuteServiceFunctionEventWithSession>(
  QpqRuntimeType.SERVICE_FUNCTION_EXE,
  (event) => {
    return event.storySession;
  },
  (qpqConfig) => getS3FileEventEventProcessor(qpqConfig),
);
