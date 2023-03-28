import {
  actionResult,
  actionResultError,
  QPQConfig,
  qpqCoreUtils,
  StoryResult,
} from 'quidproquo-core';

import {
  ServiceFunctionExecuteActionProcessor,
  ServiceFunctionActionType,
  ExecuteServiceFunctionEvent,
} from 'quidproquo-webserver';

import { executeLambdaByName } from '../../../logic/lambda/executeLambdaByName';

import { getConfigRuntimeResourceName } from '../../../awsNamingUtils';

const getServiceFunctionExecuteActionProcessor = (
  qpqConfig: QPQConfig,
): ServiceFunctionExecuteActionProcessor<any, any> => {
  return async ({ functionName, service, payload }) => {
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

    const serviceFunctionEvent: ExecuteServiceFunctionEvent<any[]> = {
      functionName: functionName,
      payload: payload,
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
        result?.error.errorStack,
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
