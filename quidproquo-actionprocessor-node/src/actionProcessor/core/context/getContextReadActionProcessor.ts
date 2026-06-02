import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  ContextActionType,
  ContextReadActionProcessor,
  QPQConfig,
  QpqContext,
  QpqContextIdentifier,
} from 'quidproquo-core';

const getContextValue = (context: QpqContext<any>, contextIdentifier: QpqContextIdentifier<any>): any => {
  return contextIdentifier.uniqueName in context ? context[contextIdentifier.uniqueName] : contextIdentifier.defaultValue;
};

const getProcessContextRead = (qpqConfig: QPQConfig): ContextReadActionProcessor<any> => {
  return async ({ contextIdentifier }, session) => {
    const context = contextIdentifier.local ? session.localContext || {} : session.context;
    return actionResult(getContextValue(context, contextIdentifier));
  };
};

export const getContextReadActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [ContextActionType.Read]: getProcessContextRead(qpqConfig),
});
