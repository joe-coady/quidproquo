import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultErrorFromCaughtError,
  ConfigActionType,
  ConfigGetParameterActionProcessor,
  QPQConfig,
} from 'quidproquo-core';

import { getOrSeedParameterValue } from '../../../logic/config';
import { ResolvedDevServerConfig } from '../../../types';

const getProcessConfigGetParameter = (qpqConfig: QPQConfig, devServerConfig: ResolvedDevServerConfig): ConfigGetParameterActionProcessor => {
  return async ({ parameterName }) => {
    try {
      const parameterValue = await getOrSeedParameterValue(devServerConfig.runtimePath, parameterName, qpqConfig);
      return actionResult(parameterValue);
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {});
    }
  };
};

export const getConfigGetParameterActionProcessor =
  (devServerConfig: ResolvedDevServerConfig): ActionProcessorListResolver =>
  async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
    [ConfigActionType.GetParameter]: getProcessConfigGetParameter(qpqConfig, devServerConfig),
  });
