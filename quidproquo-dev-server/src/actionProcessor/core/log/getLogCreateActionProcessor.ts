import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  LogActionType,
  LogCreateActionProcessor,
  LogLevelEnum,
  QPQConfig,
} from 'quidproquo-core';

import chalk from 'chalk';

const logColors = {
  [LogLevelEnum.Fatal]: chalk.bgRed.white.bold,
  [LogLevelEnum.Error]: chalk.red.bold,
  [LogLevelEnum.Warn]: chalk.yellow,
  [LogLevelEnum.Info]: chalk.cyan,
  [LogLevelEnum.Debug]: chalk.green,
  [LogLevelEnum.Trace]: chalk.gray,
};

const getProcessLogCreate = (qpqConfig: QPQConfig): LogCreateActionProcessor => {
  return async ({ msg, logLevel, data }) => {
    const colorize = logColors[logLevel] || chalk.white;
    const logMessage = colorize(`${LogLevelEnum[logLevel]}: ${msg}`);

    if (data) {
      console.log(logMessage, data);
    } else {
      console.log(logMessage);
    }

    return actionResult(void 0);
  };
};

export const getLogCreateActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [LogActionType.Create]: getProcessLogCreate(qpqConfig),
});
