import { AnyAuthChallenge } from './types';

import { UserDirectoryRespondToAuthChallengeActionRequester } from './UserDirectoryRespondToAuthChallengeActionTypes';
import { UserDirectoryActionType } from './UserDirectoryActionType';

export function* askUserDirectoryRespondToAuthChallenge(
  userDirectoryName: string,
  authChallenge: AnyAuthChallenge,
): UserDirectoryRespondToAuthChallengeActionRequester {
  return yield {
    type: UserDirectoryActionType.RespondToAuthChallenge,
    payload: {
      userDirectoryName,

      authChallenge,
    },
  };
}
