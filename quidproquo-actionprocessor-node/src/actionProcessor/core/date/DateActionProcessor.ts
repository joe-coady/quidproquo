import { DateNowActionProcessor, actionResult, DateActionType } from 'quidproquo-core';

const processDateNow: DateNowActionProcessor = async () => {
  return actionResult(new Date().toISOString());
};

export default {
  [DateActionType.Now]: processDateNow,
};
