import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultErrorFromCaughtError,
  QPQConfig,
  UserDirectoryActionType,
  UserDirectoryCreateUserActionProcessor,
} from 'quidproquo-core';

import { createDevAuthResponse, resolveDevUserDirectory } from '../../../logic/auth/devAuth';
import { upsertDevUser } from '../../../logic/auth/jsonUserStore';
import { ResolvedDevServerConfig } from '../../../types';

const getProcessCreateUser = (qpqConfig: QPQConfig, devServerConfig: ResolvedDevServerConfig): UserDirectoryCreateUserActionProcessor => {
  return async ({ userDirectoryName, createUserRequest }) => {
    try {
      // Signup just logs you straight in ~ store everything but the password
      const { password, ...userAttributes } = createUserRequest;
      const userDirectory = resolveDevUserDirectory(userDirectoryName, qpqConfig);
      await upsertDevUser(devServerConfig.runtimePath, userDirectory, createUserRequest.email, userAttributes);

      return actionResult(createDevAuthResponse(userDirectory, createUserRequest.email));
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {});
    }
  };
};

export const getUserDirectoryCreateUserActionProcessor = (
  devServerConfig: ResolvedDevServerConfig,
): ActionProcessorListResolver => async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.CreateUser]: getProcessCreateUser(qpqConfig, devServerConfig),
});
