import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultErrorFromCaughtError,
  QPQConfig,
  UserDirectoryActionType,
  UserDirectoryRespondToAuthChallengeActionProcessor,
} from 'quidproquo-core';

import { createDevAuthResponse, resolveDevUserDirectory } from '../../../logic/auth/devAuth';
import { upsertDevUser } from '../../../logic/auth/jsonUserStore';
import { ResolvedDevServerConfig } from '../../../types';

const getProcessRespondToAuthChallenge = (
  qpqConfig: QPQConfig,
  devServerConfig: ResolvedDevServerConfig,
): UserDirectoryRespondToAuthChallengeActionProcessor => {
  return async ({ userDirectoryName, authChallenge }) => {
    try {
      // Dev auth never issues challenges, but if one is answered, it always passes
      const userDirectory = resolveDevUserDirectory(userDirectoryName, qpqConfig);
      await upsertDevUser(devServerConfig.runtimePath, userDirectory, authChallenge.username);

      return actionResult(createDevAuthResponse(userDirectory, authChallenge.username));
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {});
    }
  };
};

export const getUserDirectoryRespondToAuthChallengeActionProcessor = (
  devServerConfig: ResolvedDevServerConfig,
): ActionProcessorListResolver => async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.RespondToAuthChallenge]: getProcessRespondToAuthChallenge(qpqConfig, devServerConfig),
});
