import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  QPQConfig,
  UserDirectoryActionType,
  UserDirectoryCreateUserActionProcessor,
} from 'quidproquo-core';

import { createDevAuthResponse } from '../../../logic/auth/devAuth';

const getProcessCreateUser = (_qpqConfig: QPQConfig): UserDirectoryCreateUserActionProcessor => {
  return async ({ createUserRequest }) => {
    // No real user store in dev ~ signup just logs you straight in
    return actionResult(createDevAuthResponse(createUserRequest.email));
  };
};

export const getUserDirectoryCreateUserActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.CreateUser]: getProcessCreateUser(qpqConfig),
});
