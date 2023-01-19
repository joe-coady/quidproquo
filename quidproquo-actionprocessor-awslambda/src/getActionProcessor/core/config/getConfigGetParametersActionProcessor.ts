import {
  ConfigActionType,
  ConfigGetParametersActionProcessor,
  actionResult,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';

import { QPQAWSResourceMap } from '../../../runtimeConfig/QPQAWSResourceMap';
import { resolveParameterKey } from '../../../runtimeConfig/qpqAwsLambdaRuntimeConfigUtils';

import { getParameters } from '../../../logic/parametersManager/getParameters';

const getProcessConfigGetParameters = (
  qpqConfig: QPQConfig,
  awsResourceMap: QPQAWSResourceMap,
): ConfigGetParametersActionProcessor => {
  return async ({ parameterNames }) => {
    const awsParameterKeys = parameterNames.map((pn) => resolveParameterKey(pn, awsResourceMap));
    const parameterValues = await getParameters(
      awsParameterKeys,
      qpqCoreUtils.getDeployRegion(qpqConfig),
    );

    return actionResult(parameterValues);
  };
};

export default (qpqConfig: QPQConfig, awsResourceMap: QPQAWSResourceMap) => {
  return {
    [ConfigActionType.GetParameters]: getProcessConfigGetParameters(qpqConfig, awsResourceMap),
  };
};
