import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  decomposedStringToString,
  LogActionType,
  LogTemplateLiteralActionProcessor,
  QPQConfig,
} from 'quidproquo-core';

const getProcessLogTemplateLiteral = (qpqConfig: QPQConfig): LogTemplateLiteralActionProcessor => {
  return async ({ messageParts }) => {
    const message = decomposedStringToString(messageParts);

    console.log(message);

    return actionResult(void 0);
  };
};

export const getLogTemplateLiteralActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [LogActionType.TemplateLiteral]: getProcessLogTemplateLiteral(qpqConfig),
});
