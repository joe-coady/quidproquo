import {
  ConfigActionType,
  ConfigSetParameterActionProcessor,
  actionResult,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';

import { resolveParameterKey } from '../../../runtimeConfig/qpqAwsLambdaRuntimeConfigUtils';

import { setParameter } from '../../../logic/parametersManager/setParameter';

const getProcessConfigSetParameter = (qpqConfig: QPQConfig): ConfigSetParameterActionProcessor => {
  return async ({ parameterName, parameterValue }) => {
    const awsParameterKey = resolveParameterKey(parameterName, qpqConfig);

    await setParameter(
      awsParameterKey,
      qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig),
      parameterValue,
    );

    return actionResult(void 0);
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [ConfigActionType.SetParameter]: getProcessConfigSetParameter(qpqConfig),
  };
};
