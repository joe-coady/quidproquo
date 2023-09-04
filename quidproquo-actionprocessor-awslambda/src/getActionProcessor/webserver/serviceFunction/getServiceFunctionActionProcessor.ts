import {
  actionResult,
  actionResultError,
  QPQConfig,
  qpqCoreUtils,
  StoryResult,
  StorySession,
} from 'quidproquo-core';

import {
  ServiceFunctionExecuteActionProcessor,
  ServiceFunctionActionType,
  ExecuteServiceFunctionEvent,
} from 'quidproquo-webserver';

import { executeLambdaByName } from '../../../logic/lambda/executeLambdaByName';

import { getConfigRuntimeResourceName } from '../../../awsNamingUtils';

type AnyExecuteServiceFunctionEventWithSession = ExecuteServiceFunctionEvent<any[]> & {
  storySession: StorySession;
};

const getServiceFunctionExecuteActionProcessor = (
  qpqConfig: QPQConfig,
): ServiceFunctionExecuteActionProcessor<any, any> => {
  return async ({ functionName, service, payload, context }, session) => {
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    const appName = qpqCoreUtils.getApplicationName(qpqConfig);
    const environment = qpqCoreUtils.getApplicationModuleEnvironment(qpqConfig);
    const feature = qpqCoreUtils.getApplicationModuleFeature(qpqConfig);

    const awsFunctionName = getConfigRuntimeResourceName(
      `${functionName}-sfunc`,
      appName,
      service,
      environment,
      feature,
    );

    const serviceFunctionEvent: AnyExecuteServiceFunctionEventWithSession = {
      functionName: functionName,
      payload: payload,
      storySession: {
        ...session,
        context
      },
    };

    const result = await executeLambdaByName<StoryResult<any[], any>>(
      awsFunctionName,
      region,
      serviceFunctionEvent,
    );

    if (result?.error) {
      return actionResultError(
        result?.error.errorType,
        result?.error.errorText,
        `${service}::${functionName}: ${result?.error.errorStack || ''}`,
      );
    }

    return actionResult(result?.result);
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [ServiceFunctionActionType.Execute]: getServiceFunctionExecuteActionProcessor(qpqConfig),
  };
};
