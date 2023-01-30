import {
  ConfigActionType,
  ConfigGetParameterActionProcessor,
  actionResult,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';

import { resolveParameterKey } from '../../../runtimeConfig/qpqAwsLambdaRuntimeConfigUtils';

import { getParameter } from '../../../logic/parametersManager/getParameter';

const getProcessConfigGetParameter = (qpqConfig: QPQConfig): ConfigGetParameterActionProcessor => {
  return async ({ parameterName }) => {
    const awsParameterKey = resolveParameterKey(parameterName, qpqConfig);
    const parameterValue = await getParameter(
      awsParameterKey,
      qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig),
    );

    return actionResult(parameterValue);
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [ConfigActionType.GetParameter]: getProcessConfigGetParameter(qpqConfig),
  };
};
