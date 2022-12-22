import {
  ConfigActionType,
  ConfigGetParametersActionProcessor,
  actionResult,
} from 'quidproquo-core';

import { QPQAWSLambdaConfig } from '../../../runtimeConfig/QPQAWSLambdaConfig';
import { resolveParameterKey } from '../../../runtimeConfig/qpqAwsLambdaRuntimeConfigUtils';

import { getParameters } from '../../../logic/parametersManager/getParameters';

const getProcessConfigGetParameters = (
  runtimeConfig: QPQAWSLambdaConfig,
): ConfigGetParametersActionProcessor => {
  return async ({ parameterNames }) => {
    const awsParameterKeys = parameterNames.map((pn) => resolveParameterKey(pn, runtimeConfig));
    const parameterValues = await getParameters(awsParameterKeys);

    return actionResult(parameterValues);
  };
};

export default (runtimeConfig: QPQAWSLambdaConfig) => {
  return {
    [ConfigActionType.GetParameters]: getProcessConfigGetParameters(runtimeConfig),
  };
};
