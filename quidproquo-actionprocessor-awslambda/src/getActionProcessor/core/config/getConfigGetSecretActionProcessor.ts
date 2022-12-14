import { ConfigActionType, ConfigGetSecretActionProcessor, actionResult } from 'quidproquo-core';

import { QPQAWSLambdaConfig } from '../../../runtimeConfig/QPQAWSLambdaConfig';
import { resolveSecretKey } from '../../../runtimeConfig/qpqAwsLambdaRuntimeConfigUtils';

import { getSecret } from '../../../logic/secretsManager/getSecret';

const getProcessConfigActionType = (
  runtimeConfig: QPQAWSLambdaConfig,
): ConfigGetSecretActionProcessor => {
  return async ({ secretName }) => {
    const awsSecretKey = resolveSecretKey(secretName, runtimeConfig);
    const secretValue = await getSecret(awsSecretKey);

    return actionResult(secretValue);
  };
};

export default (runtimeConfig: QPQAWSLambdaConfig) => {
  return {
    [ConfigActionType.GetSecret]: getProcessConfigActionType(runtimeConfig),
  };
};
