import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultErrorFromCaughtError,
  QPQConfig,
  UserDirectoryActionType,
  UserDirectoryGetUserAttributesActionProcessor,
} from 'quidproquo-core';

import { resolveDevUserDirectory } from '../../../logic/auth/devAuth';
import { upsertDevUser } from '../../../logic/auth/jsonUserStore';
import { ResolvedDevServerConfig } from '../../../types';

const getProcessGetUserAttributes = (
  qpqConfig: QPQConfig,
  devServerConfig: ResolvedDevServerConfig,
): UserDirectoryGetUserAttributesActionProcessor => {
  return async ({ userDirectoryName, username }) => {
    try {
      // First access by email creates the user store entry
      const userDirectory = resolveDevUserDirectory(userDirectoryName, qpqConfig);

      return actionResult(await upsertDevUser(devServerConfig.runtimePath, userDirectory, username));
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {});
    }
  };
};

export const getUserDirectoryGetUserAttributesActionProcessor = (
  devServerConfig: ResolvedDevServerConfig,
): ActionProcessorListResolver => async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.GetUserAttributes]: getProcessGetUserAttributes(qpqConfig, devServerConfig),
});
