import { ActionProcessorList, ActionProcessorListResolver, actionResult, DateActionType, DateNowActionProcessor, QPQConfig } from 'quidproquo-core';

const getProcessDateNow = (qpqConfig: QPQConfig): DateNowActionProcessor => {
  return async () => {
    return actionResult(new Date().toISOString());
  };
};

export const getDateNowActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [DateActionType.Now]: getProcessDateNow(qpqConfig),
});
