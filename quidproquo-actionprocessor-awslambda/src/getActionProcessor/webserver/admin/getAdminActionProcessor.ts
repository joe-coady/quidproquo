import {
  actionResult,
  actionResultError,
  QPQConfig,
  qpqCoreUtils,
  StoryResult,
} from 'quidproquo-core';

import { AdminGetLogsActionProcessor, AdminActionType } from 'quidproquo-webserver';

import { executeLambdaByName } from '../../../logic/lambda/executeLambdaByName';

import { getConfigRuntimeResourceName } from '../../../awsNamingUtils';

const getAdminGetLogsActionProcessor = (qpqConfig: QPQConfig): AdminGetLogsActionProcessor => {
  return async ({}) => {
    // const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    // const appName = qpqCoreUtils.getApplicationName(qpqConfig);
    // const environment = qpqCoreUtils.getApplicationModuleEnvironment(qpqConfig);
    // const feature = qpqCoreUtils.getApplicationModuleFeature(qpqConfig);

    // const awsFunctionName = getConfigRuntimeResourceName(
    //   `${functionName}-sfunc`,
    //   appName,
    //   service,
    //   environment,
    //   feature,
    // );

    // const serviceFunctionEvent: GetLogsAdminEvent<any[]> = {
    //   functionName: functionName,
    //   payload: payload,
    // };

    // const result = await executeLambdaByName<StoryResult<any[], any>>(
    //   awsFunctionName,
    //   region,
    //   serviceFunctionEvent,
    // );

    // if (result?.error) {
    //   return actionResultError(
    //     result?.error.errorType,
    //     result?.error.errorText,
    //     result?.error.errorStack,
    //   );
    // }

    return actionResult([]);
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [AdminActionType.GetLogs]: getAdminGetLogsActionProcessor(qpqConfig),
  };
};
