import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  ConfigActionType,
  ConfigGetParameterActionProcessor,
  ConfigGetParameterErrorTypeEnum,
  QPQConfig,
} from 'quidproquo-core';

import { getParameter } from '../../../logic/parametersManager/getParameter';
import { resolveParameterKey } from '../../../runtimeConfig/qpqAwsLambdaRuntimeConfigUtils';

const getProcessConfigGetParameter = (qpqConfig: QPQConfig): ConfigGetParameterActionProcessor => {
  return async ({ parameterName }) => {
    const awsParameterKey = resolveParameterKey(parameterName, qpqConfig);

    try {
      const parameterValue = await getParameter(awsParameterKey, qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig));
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
