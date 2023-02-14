import {
  UserDirectoryCreateUserActionProcessor,
  actionResult,
  QPQConfig,
  qpqCoreUtils,
  UserDirectoryActionType,
} from 'quidproquo-core';

const getUserDirectoryCreateUserActionProcessor = (
  qpqConfig: QPQConfig,
): UserDirectoryCreateUserActionProcessor => {
  return async (payload) => {
    return actionResult(false);
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [UserDirectoryActionType.CreateUser]: getUserDirectoryCreateUserActionProcessor(qpqConfig),
  };
};
