import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultErrorFromCaughtError,
  ConfigActionType,
  ConfigGetSecretActionProcessor,
  QPQConfig,
} from 'quidproquo-core';

import { getOrSeedSecretValue } from '../../../logic/config';
import { ResolvedDevServerConfig } from '../../../types';

const getProcessConfigGetSecret = (qpqConfig: QPQConfig, devServerConfig: ResolvedDevServerConfig): ConfigGetSecretActionProcessor => {
  return async ({ secretName }) => {
    try {
      const secretValue = await getOrSeedSecretValue(devServerConfig.runtimePath, secretName, qpqConfig);
      return actionResult(secretValue);
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {});
    }
  };
};

export const getConfigGetSecretActionProcessor = (
  devServerConfig: ResolvedDevServerConfig,
): ActionProcessorListResolver => async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [ConfigActionType.GetSecret]: getProcessConfigGetSecret(qpqConfig, devServerConfig),
});
