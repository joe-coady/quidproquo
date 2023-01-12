import { ConfigActionType, ConfigGetSecretActionProcessor, actionResult } from 'quidproquo-core';
import { qpqWebServerUtils } from 'quidproquo-webserver';

import { QPQAWSLambdaConfig } from '../../../runtimeConfig/QPQAWSLambdaConfig';
import { resolveSecretKey } from '../../../runtimeConfig/qpqAwsLambdaRuntimeConfigUtils';

import { getSecret } from '../../../logic/secretsManager/getSecret';

const getProcessConfigActionType = (
  runtimeConfig: QPQAWSLambdaConfig,
): ConfigGetSecretActionProcessor => {
  return async ({ secretName }) => {
    const awsSecretKey = resolveSecretKey(secretName, runtimeConfig);
    const secretValue = await getSecret(
      awsSecretKey,
      qpqWebServerUtils.getDeployRegion(runtimeConfig.qpqConfig),
    );

    return actionResult(secretValue);
  };
};

export default (runtimeConfig: QPQAWSLambdaConfig) => {
  return {
    [ConfigActionType.GetSecret]: getProcessConfigActionType(runtimeConfig),
  };
};
