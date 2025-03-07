import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  LogActionType,
  LogDisableEventHistoryActionProcessor,
  QPQConfig,
} from 'quidproquo-core';

const getProcessLogDisableEventHistory = (qpqConfig: QPQConfig): LogDisableEventHistoryActionProcessor => {
  return async ({ enable, reason }, session, _actionProcessors, logger) => {
    await logger.enableLogs(enable, reason, session.correlation || '');

    return actionResult(void 0);
  };
};

export const getLogDisableEventHistoryActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [LogActionType.DisableEventHistory]: getProcessLogDisableEventHistory(qpqConfig),
});
