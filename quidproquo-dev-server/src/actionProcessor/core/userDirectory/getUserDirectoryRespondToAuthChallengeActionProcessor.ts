import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  QPQConfig,
  UserDirectoryActionType,
  UserDirectoryRespondToAuthChallengeActionProcessor,
} from 'quidproquo-core';

import { createDevAuthResponse } from '../../../logic/auth/devAuth';

const getProcessRespondToAuthChallenge = (_qpqConfig: QPQConfig): UserDirectoryRespondToAuthChallengeActionProcessor => {
  return async ({ authChallenge }) => {
    // Dev auth never issues challenges, but if one is answered, it always passes
    return actionResult(createDevAuthResponse(authChallenge.username));
  };
};

export const getUserDirectoryRespondToAuthChallengeActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.RespondToAuthChallenge]: getProcessRespondToAuthChallenge(qpqConfig),
});
