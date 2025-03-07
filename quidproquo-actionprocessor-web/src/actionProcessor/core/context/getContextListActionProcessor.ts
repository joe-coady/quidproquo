import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  ContextActionType,
  ContextListActionProcessor,
  QPQConfig,
} from 'quidproquo-core';

const getProcessContextList = (qpqConfig: QPQConfig): ContextListActionProcessor => {
  return async (payload, session) => {
    return actionResult(session.context);
  };
};

export const getContextListActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [ContextActionType.List]: getProcessContextList(qpqConfig),
});
