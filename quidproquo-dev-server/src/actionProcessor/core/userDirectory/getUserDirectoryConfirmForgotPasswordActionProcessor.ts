import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultErrorFromCaughtError,
  QPQConfig,
  UserDirectoryActionType,
  UserDirectoryConfirmForgotPasswordActionProcessor,
} from 'quidproquo-core';

import { createDevAuthResponse, resolveDevUserDirectory } from '../../../logic/auth/devAuth';
import { upsertDevUser } from '../../../logic/auth/jsonUserStore';
import { ResolvedDevServerConfig } from '../../../types';

const getProcessConfirmForgotPassword = (
  qpqConfig: QPQConfig,
  devServerConfig: ResolvedDevServerConfig,
): UserDirectoryConfirmForgotPasswordActionProcessor => {
  return async ({ userDirectoryName, username }) => {
    try {
      // Any confirmation code is accepted in dev
      const userDirectory = resolveDevUserDirectory(userDirectoryName, qpqConfig);
      await upsertDevUser(devServerConfig.runtimePath, userDirectory, username);

      return actionResult(createDevAuthResponse(userDirectory, username));
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {});
    }
  };
};

export const getUserDirectoryConfirmForgotPasswordActionProcessor = (
  devServerConfig: ResolvedDevServerConfig,
): ActionProcessorListResolver => async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.ConfirmForgotPassword]: getProcessConfirmForgotPassword(qpqConfig, devServerConfig),
});
