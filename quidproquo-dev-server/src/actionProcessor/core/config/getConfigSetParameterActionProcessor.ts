import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultErrorFromCaughtError,
  ConfigActionType,
  ConfigSetParameterActionProcessor,
  QPQConfig,
} from 'quidproquo-core';

import { setParameterValue } from '../../../logic/config';
import { ResolvedDevServerConfig } from '../../../types';

const getProcessConfigSetParameter = (qpqConfig: QPQConfig, devServerConfig: ResolvedDevServerConfig): ConfigSetParameterActionProcessor => {
  return async ({ parameterName, parameterValue }) => {
    try {
      await setParameterValue(devServerConfig.runtimePath, parameterName, qpqConfig, parameterValue);
      return actionResult(undefined);
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {});
    }
  };
};

export const getConfigSetParameterActionProcessor =
  (devServerConfig: ResolvedDevServerConfig): ActionProcessorListResolver =>
  async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
    [ConfigActionType.SetParameter]: getProcessConfigSetParameter(qpqConfig, devServerConfig),
  });
