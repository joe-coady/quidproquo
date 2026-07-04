import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  QPQConfig,
  SystemActionType,
  SystemGetRuntimeCorrelationActionProcessor,
} from 'quidproquo-core';

const getProcessSystemGetRuntimeCorrelation = (qpqConfig: QPQConfig): SystemGetRuntimeCorrelationActionProcessor => {
  return async (payload, session) => {
    return actionResult(session.correlation);
  };
};

export const getSystemGetRuntimeCorrelationActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [SystemActionType.GetRuntimeCorrelation]: getProcessSystemGetRuntimeCorrelation(qpqConfig),
});
