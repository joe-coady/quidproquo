import {
  ErrorActionType,
  ErrorThrowErrorActionProcessor,
  actionResultError,
} from 'quidproquo-core';

const processThrowError: ErrorThrowErrorActionProcessor = async ({
  errorStack,
  errorText,
  errorType,
}) => {
  return actionResultError(errorType, errorText, errorStack);
};

export default {
  [ErrorActionType.ThrowError]: processThrowError,
};
