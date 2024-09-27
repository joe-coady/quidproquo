import {
  ConfigActionType,
  ConfigSetParameterActionProcessor,
  actionResult,
  QPQConfig,
  qpqCoreUtils,
  ActionProcessorList,
  ActionProcessorListResolver,
} from 'quidproquo-core';

import { resolveParameterKey } from '../../../runtimeConfig/qpqAwsLambdaRuntimeConfigUtils';

import { setParameter } from '../../../logic/parametersManager/setParameter';

const getProcessConfigSetParameter = (qpqConfig: QPQConfig): ConfigSetParameterActionProcessor => {
  return async ({ parameterName, parameterValue }) => {
    const awsParameterKey = resolveParameterKey(parameterName, qpqConfig);

    await setParameter(awsParameterKey, qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig), parameterValue);

    return actionResult(void 0);
  };
};

export const getConfigSetParameterActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [ConfigActionType.SetParameter]: getProcessConfigSetParameter(qpqConfig),
});
