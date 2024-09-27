import {
  ConfigActionType,
  ConfigGetParameterActionProcessor,
  actionResult,
  QPQConfig,
  qpqCoreUtils,
  ActionProcessorListResolver,
  ActionProcessorList,
  actionResultErrorFromCaughtError,
  actionResultError,
  ConfigGetParameterErrorTypeEnum,
} from 'quidproquo-core';

import { resolveParameterKey } from '../../../runtimeConfig/qpqAwsLambdaRuntimeConfigUtils';

import { getParameter } from '../../../logic/parametersManager/getParameter';

const getProcessConfigGetParameter = (qpqConfig: QPQConfig): ConfigGetParameterActionProcessor => {
  return async ({ parameterName }) => {
    const awsParameterKey = resolveParameterKey(parameterName, qpqConfig);

    try {
      const parameterValue = await getParameter(awsParameterKey, qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig));
      return actionResult(parameterValue);
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        ThrottlingException: () => actionResultError(ConfigGetParameterErrorTypeEnum.Throttling, 'Throttling: Rate exceeded'),
      });
    }
  };
};

export const getConfigGetParameterActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [ConfigActionType.GetParameter]: getProcessConfigGetParameter(qpqConfig),
});
