import { LogCreateActionProcessor, actionResult, LogActionType } from 'quidproquo-core';

const processLogCreate: LogCreateActionProcessor = async ({ msg, logLevel, data }) => {
  if (data) {
    console.log(`${logLevel}: ${msg}`, data);
  } else {
    console.log(`${logLevel}: ${msg}`);
  }

  return actionResult(void 0);
};

export default {
  [LogActionType.Create]: processLogCreate,
};
