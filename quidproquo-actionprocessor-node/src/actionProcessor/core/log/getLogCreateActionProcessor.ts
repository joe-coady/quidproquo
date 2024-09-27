import { LogCreateActionProcessor, actionResult, LogActionType, ActionProcessorListResolver, QPQConfig, ActionProcessorList } from 'quidproquo-core';

const getProcessLogCreate = (qpqConfig: QPQConfig): LogCreateActionProcessor => {
  return async ({ msg, logLevel, data }) => {
    if (data) {
      console.log(`${logLevel}: ${msg}`, data);
    } else {
      console.log(`${logLevel}: ${msg}`);
    }

    return actionResult(void 0);
  };
};

export const getLogCreateActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [LogActionType.Create]: getProcessLogCreate(qpqConfig),
});
