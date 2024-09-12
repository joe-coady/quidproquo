import {
  ConfigActionType,
  ConfigGetSecretActionProcessor,
  actionResult,
  QPQConfig,
  qpqCoreUtils,
  ActionProcessorListResolver,
  ActionProcessorList,
} from 'quidproquo-core';

import { getSecret } from '../../../logic/secretsManager/getSecret';
import { resolveSecretResourceName } from './utils';

const getProcessConfigGetSecret = (qpqConfig: QPQConfig): ConfigGetSecretActionProcessor => {
  return async ({ secretName }) => {
    const awsSecretKey = resolveSecretResourceName(secretName, qpqConfig);
    const secretValue = await getSecret(awsSecretKey, qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig));

    return actionResult(secretValue);
  };
};

export const getConfigGetSecretActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [ConfigActionType.GetSecret]: getProcessConfigGetSecret(qpqConfig),
});
