import {
  ConfigActionType,
  ConfigGetParameterActionProcessor,
  actionResult,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';

import { QPQAWSResourceMap } from '../../../runtimeConfig/QPQAWSResourceMap';
import { resolveParameterKey } from '../../../runtimeConfig/qpqAwsLambdaRuntimeConfigUtils';

import { getParameter } from '../../../logic/parametersManager/getParameter';

const getProcessConfigGetParameter = (
  qpqConfig: QPQConfig,
  awsResourceMap: QPQAWSResourceMap,
): ConfigGetParameterActionProcessor => {
  return async ({ parameterName }) => {
    const awsParameterKey = resolveParameterKey(parameterName, awsResourceMap);
    const parameterValue = await getParameter(
      awsParameterKey,
      qpqCoreUtils.getDeployRegion(qpqConfig),
    );

    return actionResult(parameterValue);
  };
};

export default (qpqConfig: QPQConfig, awsResourceMap: QPQAWSResourceMap) => {
  return {
    [ConfigActionType.GetParameter]: getProcessConfigGetParameter(qpqConfig, awsResourceMap),
  };
};
