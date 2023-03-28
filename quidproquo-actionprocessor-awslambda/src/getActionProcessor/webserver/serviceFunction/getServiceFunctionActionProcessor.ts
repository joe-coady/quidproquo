import { actionResult, QPQConfig, qpqCoreUtils } from 'quidproquo-core';

import {
  ServiceFunctionExecuteActionProcessor,
  ServiceFunctionActionType,
} from 'quidproquo-webserver';

import { executeLambdaByName } from '../../../logic/lambda/executeLambdaByName';

import { getConfigRuntimeResourceName } from '../../../awsNamingUtils';

const getServiceFunctionExecuteActionProcessor = (
  qpqConfig: QPQConfig,
): ServiceFunctionExecuteActionProcessor<any> => {
  return async ({ functionName, service, arg }) => {
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

    const result = await executeLambdaByName(awsFunctionName, region, arg);

    return actionResult(result);
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [ServiceFunctionActionType.Execute]: getServiceFunctionExecuteActionProcessor(qpqConfig),
  };
};
