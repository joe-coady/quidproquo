import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  ConfigActionType,
  ConfigListParametersActionProcessor,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';

const getProcessConfigListParameters = (qpqConfig: QPQConfig): ConfigListParametersActionProcessor => {
  const paramConfigs = qpqCoreUtils.getOwnedParameterConfigs(qpqConfig).map((pc) => pc.key);
  return async () => {
    return actionResult(paramConfigs);
  };
};

export const getConfigListParametersActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [ConfigActionType.ListParameters]: getProcessConfigListParameters(qpqConfig),
});
