import {
  ConfigActionType,
  ConfigGetParametersActionProcessor,
  actionResult,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';

import { resolveParameterKey } from '../../../runtimeConfig/qpqAwsLambdaRuntimeConfigUtils';

import { getParameters } from '../../../logic/parametersManager/getParameters';

const getProcessConfigGetParameters = (
  qpqConfig: QPQConfig,
): ConfigGetParametersActionProcessor => {
  return async ({ parameterNames }) => {
    const awsParameterKeys = parameterNames.map((pn) => resolveParameterKey(pn, qpqConfig));
    const parameterValues = await getParameters(
      awsParameterKeys,
      qpqCoreUtils.getDeployRegion(qpqConfig),
    );

    return actionResult(parameterValues);
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [ConfigActionType.GetParameters]: getProcessConfigGetParameters(qpqConfig),
  };
};
