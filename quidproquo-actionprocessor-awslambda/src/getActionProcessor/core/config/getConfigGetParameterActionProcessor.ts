import { ConfigActionType, ConfigGetParameterActionProcessor, actionResult } from 'quidproquo-core';
import { qpqWebServerUtils } from 'quidproquo-webserver';

import { QPQAWSLambdaConfig } from '../../../runtimeConfig/QPQAWSLambdaConfig';
import { resolveParameterKey } from '../../../runtimeConfig/qpqAwsLambdaRuntimeConfigUtils';

import { getParameter } from '../../../logic/parametersManager/getParameter';

const getProcessConfigGetParameter = (
  runtimeConfig: QPQAWSLambdaConfig,
): ConfigGetParameterActionProcessor => {
  return async ({ parameterName }) => {
    const awsParameterKey = resolveParameterKey(parameterName, runtimeConfig);
    const parameterValue = await getParameter(
      awsParameterKey,
      qpqWebServerUtils.getDeployRegion(runtimeConfig.qpqConfig),
    );

    return actionResult(parameterValue);
  };
};

export default (runtimeConfig: QPQAWSLambdaConfig) => {
  return {
    [ConfigActionType.GetParameter]: getProcessConfigGetParameter(runtimeConfig),
  };
};
