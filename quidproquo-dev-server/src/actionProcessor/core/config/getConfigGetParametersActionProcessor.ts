import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultErrorFromCaughtError,
  ConfigActionType,
  ConfigGetParametersActionProcessor,
  QPQConfig,
} from 'quidproquo-core';

import { getOrSeedParameterValue } from '../../../logic/config';
import { ResolvedDevServerConfig } from '../../../types';

const getProcessConfigGetParameters = (qpqConfig: QPQConfig, devServerConfig: ResolvedDevServerConfig): ConfigGetParametersActionProcessor => {
  return async ({ parameterNames }) => {
    try {
      // Sequential on purpose: seeding two parameters in the same service file
      // concurrently would race the read-modify-write and drop one of them.
      const parameterValues: string[] = [];
      for (const parameterName of parameterNames) {
        parameterValues.push(await getOrSeedParameterValue(devServerConfig.runtimePath, parameterName, qpqConfig));
      }

      return actionResult(parameterValues);
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {});
    }
  };
};

export const getConfigGetParametersActionProcessor =
  (devServerConfig: ResolvedDevServerConfig): ActionProcessorListResolver =>
  async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
    [ConfigActionType.GetParameters]: getProcessConfigGetParameters(qpqConfig, devServerConfig),
  });
