import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  QPQConfig,
  UserDirectoryActionType,
  UserDirectoryAuthenticateUserActionProcessor,
} from 'quidproquo-core';

import { createDevAuthResponse } from '../../../logic/auth/devAuth';

const getProcessAuthenticateUser = (_qpqConfig: QPQConfig): UserDirectoryAuthenticateUserActionProcessor => {
  return async ({ authenticateUserRequest }) => {
    // Any username / password is accepted in dev ~ mint an unsigned JWT for whatever was typed in
    return actionResult(createDevAuthResponse(authenticateUserRequest.email));
  };
};

export const getUserDirectoryAuthenticateUserActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.AuthenticateUser]: getProcessAuthenticateUser(qpqConfig),
});
