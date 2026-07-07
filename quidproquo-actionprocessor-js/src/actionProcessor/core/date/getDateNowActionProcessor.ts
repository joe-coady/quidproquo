import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  DateActionType,
  DateNowActionProcessor,
  getQpqIsoDateTimeFromDate,
  QPQConfig,
} from 'quidproquo-core';

const getProcessDateNow = (qpqConfig: QPQConfig): DateNowActionProcessor => {
  return async () => {
    return actionResult(getQpqIsoDateTimeFromDate(new Date()));
  };
};

export const getDateNowActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [DateActionType.Now]: getProcessDateNow(qpqConfig),
});
