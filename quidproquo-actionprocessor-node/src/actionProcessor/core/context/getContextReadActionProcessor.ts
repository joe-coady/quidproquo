import {
  QPQConfig,
  actionResult,
  ContextActionType,
  ContextReadActionProcessor,
  QpqContext,
  QpqContextIdentifier,
  ActionProcessorListResolver,
  ActionProcessorList,
} from 'quidproquo-core';

const getContextValue = (context: QpqContext<any>, contextIdentifier: QpqContextIdentifier<any>): any => {
  return contextIdentifier.uniqueName in context ? context[contextIdentifier.uniqueName] : contextIdentifier.defaultValue;
};

const getProcessContextRead = (qpqConfig: QPQConfig): ContextReadActionProcessor<any> => {
  return async ({ contextIdentifier }, session) => {
    return actionResult(getContextValue(session.context, contextIdentifier));
  };
};

export const getContextReadActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [ContextActionType.Read]: getProcessContextRead(qpqConfig),
});
