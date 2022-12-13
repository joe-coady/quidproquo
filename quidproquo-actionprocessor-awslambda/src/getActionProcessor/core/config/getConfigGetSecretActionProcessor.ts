import { ConfigActionType, ConfigGetSecretActionProcessor, actionResult } from 'quidproquo-core';

import { QPQAWSLambdaConfig } from '../../../runtimeConfig/QPQAWSLambdaConfig';

import { getSecret } from '../../../logic/secretsManager/getSecret';

const getProcessConfigActionType = (): ConfigGetSecretActionProcessor => {
  return async ({ secretName }) => {
    const secretValue = await getSecret(secretName);
    return actionResult(secretValue);
  };
};

export default (runtimeConfig: QPQAWSLambdaConfig) => {
  return {
    [ConfigActionType.GetSecret]: getProcessConfigActionType(),
  };
};
