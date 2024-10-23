import { AnyAuthChallenge } from './types';
import { UserDirectoryActionType } from './UserDirectoryActionType';
import { UserDirectoryRespondToAuthChallengeActionRequester } from './UserDirectoryRespondToAuthChallengeActionTypes';

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
