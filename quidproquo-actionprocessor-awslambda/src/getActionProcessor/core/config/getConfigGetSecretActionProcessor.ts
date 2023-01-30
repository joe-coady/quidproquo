import {
  ConfigActionType,
  ConfigGetSecretActionProcessor,
  actionResult,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';

import { resolveSecretKey } from '../../../runtimeConfig/qpqAwsLambdaRuntimeConfigUtils';

import { getSecret } from '../../../logic/secretsManager/getSecret';

const getProcessConfigActionType = (qpqConfig: QPQConfig): ConfigGetSecretActionProcessor => {
  return async ({ secretName }) => {
    const awsSecretKey = resolveSecretKey(secretName, qpqConfig);
    const secretValue = await getSecret(
      awsSecretKey,
      qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig),
    );

    return actionResult(secretValue);
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [ConfigActionType.GetSecret]: getProcessConfigActionType(qpqConfig),
  };
};
