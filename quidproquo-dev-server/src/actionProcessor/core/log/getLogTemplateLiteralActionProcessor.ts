import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  DecomposedStringPrimitive,
  LogActionType,
  LogTemplateLiteralActionProcessor,
  QPQConfig,
} from 'quidproquo-core';

import chalk from 'chalk';

const getProcessLogTemplateLiteral = (qpqConfig: QPQConfig): LogTemplateLiteralActionProcessor => {
  return async ({ messageParts: [strings, values] }) => {
    const message = values.reduce(
      (str: string, value: DecomposedStringPrimitive, index: number) => str + chalk.yellowBright(String(value)) + chalk.white(strings[index + 1]),
      chalk.white(strings[0]),
    );

    console.log(message);

    return actionResult(void 0);
  };
};

export const getLogTemplateLiteralActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [LogActionType.TemplateLiteral]: getProcessLogTemplateLiteral(qpqConfig),
});
