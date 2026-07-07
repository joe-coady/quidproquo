import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  QPQConfig,
  UserDirectoryActionType,
  UserDirectoryConfirmEmailVerificationActionProcessor,
} from 'quidproquo-core';

const getProcessConfirmEmailVerification = (_qpqConfig: QPQConfig): UserDirectoryConfirmEmailVerificationActionProcessor => {
  return async () => {
    // Any verification code is accepted in dev
    return actionResult(void 0);
  };
};

export const getUserDirectoryConfirmEmailVerificationActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.ConfirmEmailVerification]: getProcessConfirmEmailVerification(qpqConfig),
});
