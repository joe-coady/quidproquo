import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  QPQConfig,
  UserDirectoryActionType,
  UserDirectoryGetUserAttributesByUserIdActionProcessor,
  UserDirectoryGetUserAttributesByUserIdErrorTypeEnum,
} from 'quidproquo-core';

import { resolveDevUserDirectory } from '../../../logic/auth/devAuth';
import { getDevUserByUserId } from '../../../logic/auth/jsonUserStore';
import { ResolvedDevServerConfig } from '../../../types';

const getProcessGetUserAttributesByUserId = (
  qpqConfig: QPQConfig,
  devServerConfig: ResolvedDevServerConfig,
): UserDirectoryGetUserAttributesByUserIdActionProcessor => {
  return async ({ userDirectoryName, userId }) => {
    try {
      const userDirectory = resolveDevUserDirectory(userDirectoryName, qpqConfig);
      const user = await getDevUserByUserId(devServerConfig.runtimePath, userDirectory, userId);

      if (!user) {
        return actionResultError(UserDirectoryGetUserAttributesByUserIdErrorTypeEnum.UserNotFound, `User not found [${userId}]`);
      }

      return actionResult(user);
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {});
    }
  };
};

export const getUserDirectoryGetUserAttributesByUserIdActionProcessor = (
  devServerConfig: ResolvedDevServerConfig,
): ActionProcessorListResolver => async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.GetUserAttributesByUserId]: getProcessGetUserAttributesByUserId(qpqConfig, devServerConfig),
});
