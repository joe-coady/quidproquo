import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  QPQConfig,
  UserDirectoryActionType,
  UserDirectoryConfirmForgotPasswordActionProcessor,
} from 'quidproquo-core';

import { createDevAuthResponse } from '../../../logic/auth/devAuth';

const getProcessConfirmForgotPassword = (_qpqConfig: QPQConfig): UserDirectoryConfirmForgotPasswordActionProcessor => {
  return async ({ username }) => {
    // Any confirmation code is accepted in dev
    return actionResult(createDevAuthResponse(username));
  };
};

export const getUserDirectoryConfirmForgotPasswordActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.ConfirmForgotPassword]: getProcessConfirmForgotPassword(qpqConfig),
});
