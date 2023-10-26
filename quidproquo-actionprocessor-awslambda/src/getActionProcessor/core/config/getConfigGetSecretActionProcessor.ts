import {
  ConfigActionType,
  ConfigGetSecretActionProcessor,
  actionResult,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';

import { getSecret } from '../../../logic/secretsManager/getSecret';
import { resolveSecretResourceName } from './utils';

const getProcessConfigActionType = (qpqConfig: QPQConfig): ConfigGetSecretActionProcessor => {
  return async ({ secretName }) => {
    const awsSecretKey = resolveSecretResourceName(secretName, qpqConfig);
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
