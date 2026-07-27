import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  ConfigActionType,
  ConfigGetGlobalActionProcessor,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';

// any: one processor serves globals of every declared type; the per-call generic
// is only meaningful at the requester, so the variance boundary needs any.
const getProcessConfigGetGlobal = (qpqConfig: QPQConfig): ConfigGetGlobalActionProcessor<any> => {
  return async ({ globalName }, session) => {
    const globalValue = qpqCoreUtils.resolveGlobalValue(qpqConfig, session.functionGlobals, globalName);
    return actionResult(globalValue);
  };
};

export const getConfigGetGlobalActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [ConfigActionType.GetGlobal]: getProcessConfigGetGlobal(qpqConfig),
});
