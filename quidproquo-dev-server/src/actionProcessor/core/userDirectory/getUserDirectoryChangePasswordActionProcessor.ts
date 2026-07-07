import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  QPQConfig,
  UserDirectoryActionType,
  UserDirectoryChangePasswordActionProcessor,
} from 'quidproquo-core';

const getProcessChangePassword = (_qpqConfig: QPQConfig): UserDirectoryChangePasswordActionProcessor => {
  return async () => {
    // Passwords are not stored in dev
    return actionResult(void 0);
  };
};

export const getUserDirectoryChangePasswordActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.ChangePassword]: getProcessChangePassword(qpqConfig),
});
