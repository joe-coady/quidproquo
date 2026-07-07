import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultErrorFromCaughtError,
  QPQConfig,
  UserDirectoryActionType,
  UserDirectoryGetUsersActionProcessor,
} from 'quidproquo-core';

import { resolveDevUserDirectory } from '../../../logic/auth/devAuth';
import { listDevUsers } from '../../../logic/auth/jsonUserStore';
import { ResolvedDevServerConfig } from '../../../types';

const getProcessGetUsers = (qpqConfig: QPQConfig, devServerConfig: ResolvedDevServerConfig): UserDirectoryGetUsersActionProcessor => {
  return async ({ userDirectoryName }) => {
    try {
      const userDirectory = resolveDevUserDirectory(userDirectoryName, qpqConfig);

      return actionResult({
        items: await listDevUsers(devServerConfig.runtimePath, userDirectory),
      });
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {});
    }
  };
};

export const getUserDirectoryGetUsersActionProcessor =
  (devServerConfig: ResolvedDevServerConfig): ActionProcessorListResolver =>
  async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
    [UserDirectoryActionType.GetUsers]: getProcessGetUsers(qpqConfig, devServerConfig),
  });
