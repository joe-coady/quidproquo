import {
  ActionProcessorList,
  ActionProcessorListResolver,
  ErrorActionType,
  ErrorThrowErrorActionProcessor,
  QPQConfig,
  actionResultError,
} from 'quidproquo-core';

const getProcessErrorThrowError = (qpqConfig: QPQConfig): ErrorThrowErrorActionProcessor => {
  return async ({ errorStack, errorText, errorType }) => {
    return actionResultError(errorType, errorText, errorStack);
  };
};

export const getErrorThrowErrorActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [ErrorActionType.ThrowError]: getProcessErrorThrowError(qpqConfig),
});
