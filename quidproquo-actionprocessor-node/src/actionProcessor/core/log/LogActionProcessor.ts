import { LogCreateActionProcessor, actionResult, LogActionType } from 'quidproquo-core';

const processLogCreate: LogCreateActionProcessor = async ({ msg, logLevel, dataJson }) => {
  console.log(`${logLevel}: ${msg} ${dataJson || ''}`);

  return actionResult(void 0);
};

export default {
  [LogActionType.Create]: processLogCreate,
};
