import {
  ConfigActionType,
  ConfigGetGlobalActionProcessor,
  actionResult,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';

const getProcessConfigActionType = (qpqConfig: QPQConfig): ConfigGetGlobalActionProcessor<any> => {
  return async ({ globalName }) => {
    const globalValue = qpqCoreUtils.getGlobalConfigValue(qpqConfig, globalName);
    return actionResult(globalValue);
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [ConfigActionType.GetGlobal]: getProcessConfigActionType(qpqConfig),
  };
};
