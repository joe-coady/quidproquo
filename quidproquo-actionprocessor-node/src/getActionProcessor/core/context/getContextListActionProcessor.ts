import {
  QPQConfig,
  actionResult,
  ContextActionType,
  ContextListActionProcessor
} from 'quidproquo-core';

const getContextListActionProcessor = (
  qpqConfig: QPQConfig,
): ContextListActionProcessor => {
  return async (payload, session) => {
    return actionResult(session.context);
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [ContextActionType.List]: getContextListActionProcessor(qpqConfig),
  };
};
