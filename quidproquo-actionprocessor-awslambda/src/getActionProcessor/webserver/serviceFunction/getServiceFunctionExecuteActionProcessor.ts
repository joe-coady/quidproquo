import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  EitherActionResult,
  QPQConfig,
  qpqCoreUtils,
  StorySession,
} from 'quidproquo-core';
import { ExecuteServiceFunctionEvent, ServiceFunctionActionType, ServiceFunctionExecuteActionProcessor } from 'quidproquo-webserver';

import { getConfigRuntimeResourceName } from '../../../awsNamingUtils';
import { executeLambdaByName } from '../../../logic/lambda/executeLambdaByName';

type AnyExecuteServiceFunctionEventWithSession = ExecuteServiceFunctionEvent<any[]> & {
  storySession: StorySession;
};

const getProcessExecute = (qpqConfig: QPQConfig): ServiceFunctionExecuteActionProcessor<any, any> => {
  return async ({ functionName, service, payload, context, isAsync }, session) => {
    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);

    const appName = qpqCoreUtils.getApplicationName(qpqConfig);
    const environment = qpqCoreUtils.getApplicationModuleEnvironment(qpqConfig);
    const feature = qpqCoreUtils.getApplicationModuleFeature(qpqConfig);

    const awsFunctionName = getConfigRuntimeResourceName(`${functionName}-sfunc`, appName, service, environment, feature);

    const serviceFunctionEvent: AnyExecuteServiceFunctionEventWithSession = {
      functionName: functionName,
      payload: payload,
      storySession: {
        ...session,
        context,
      },
    };

    const result = await executeLambdaByName<EitherActionResult<any>>(awsFunctionName, region, serviceFunctionEvent, isAsync);

    if (!result) {
      return actionResult(void 0);
    }

    if (!result.success) {
      return actionResultError(result.error.errorType, result.error.errorText, `${service}::${functionName}: ${result?.error.errorStack || ''}`);
    }

    return actionResult(result.result);
  };
};

export const getServiceFunctionExecuteActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [ServiceFunctionActionType.Execute]: getProcessExecute(qpqConfig),
});
