import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  QPQConfig,
  UserDirectoryActionType,
  UserDirectoryForgotPasswordActionProcessor,
} from 'quidproquo-core';

import { resolveDevUsername } from '../../../logic/auth/devAuth';

const getProcessForgotPassword = (_qpqConfig: QPQConfig): UserDirectoryForgotPasswordActionProcessor => {
  return async ({ username }) => {
    // No email is actually sent in dev
    return actionResult({
      attributeName: 'email',
      deliveryMedium: 'EMAIL',
      destination: resolveDevUsername(username),
    });
  };
};

export const getUserDirectoryForgotPasswordActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.ForgotPassword]: getProcessForgotPassword(qpqConfig),
});
