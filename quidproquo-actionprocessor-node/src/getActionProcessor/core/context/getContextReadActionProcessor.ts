import {
  QPQConfig,
  actionResult,
  ContextActionType,
  ContextReadActionProcessor,
  QpqContext,
  QpqContextIdentifier,
} from 'quidproquo-core';

const getContextValue = (context: QpqContext<any>, contextIdentifier: QpqContextIdentifier<any>): any => {
  return contextIdentifier.uniqueName in context ? context[contextIdentifier.uniqueName] : contextIdentifier.defaultValue;
};

const getContextReadActionProcessor = (
  qpqConfig: QPQConfig,
): ContextReadActionProcessor<any> => {
  return async ({ contextIdentifier }, session) => {
    return actionResult(getContextValue(session.context, contextIdentifier));
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [ContextActionType.Read]: getContextReadActionProcessor(qpqConfig),
  };
};
