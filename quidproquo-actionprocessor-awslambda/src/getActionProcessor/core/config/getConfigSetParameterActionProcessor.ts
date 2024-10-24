import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  ConfigActionType,
  ConfigSetParameterActionProcessor,
  QPQConfig,
} from 'quidproquo-core';

import { setParameter } from '../../../logic/parametersManager/setParameter';
import { resolveParameterKey } from '../../../runtimeConfig/qpqAwsLambdaRuntimeConfigUtils';

const getProcessConfigSetParameter = (qpqConfig: QPQConfig): ConfigSetParameterActionProcessor => {
  return async ({ parameterName, parameterValue }) => {
    const awsParameterKey = resolveParameterKey(parameterName, qpqConfig);

    await setParameter(awsParameterKey, qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig), parameterValue);

    return actionResult(void 0);
  };
};

export const getConfigSetParameterActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [ConfigActionType.SetParameter]: getProcessConfigSetParameter(qpqConfig),
});
