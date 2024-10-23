import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  ConfigActionType,
  ConfigGetGlobalActionProcessor,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';

const getProcessConfigGetGlobal = (qpqConfig: QPQConfig): ConfigGetGlobalActionProcessor<any> => {
  return async ({ globalName }) => {
    const globalValue = qpqCoreUtils.getGlobalConfigValue(qpqConfig, globalName);
    return actionResult(globalValue);
  };
};

export const getConfigGetGlobalActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [ConfigActionType.GetGlobal]: getProcessConfigGetGlobal(qpqConfig),
});
