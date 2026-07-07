import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  QPQConfig,
  UserDirectoryActionType,
  UserDirectorySetPasswordActionProcessor,
} from 'quidproquo-core';

const getProcessSetPassword = (_qpqConfig: QPQConfig): UserDirectorySetPasswordActionProcessor => {
  return async () => {
    // Passwords are not stored in dev
    return actionResult(void 0);
  };
};

export const getUserDirectorySetPasswordActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.SetPassword]: getProcessSetPassword(qpqConfig),
});
