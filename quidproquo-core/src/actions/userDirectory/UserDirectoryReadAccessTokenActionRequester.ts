import { UserDirectoryReadAccessTokenActionRequester } from './UserDirectoryReadAccessTokenActionTypes';
import { UserDirectoryActionType } from './UserDirectoryActionType';

export function* askUserDirectoryReadAccessToken(
  userDirectoryName: string,
  ignoreExpiration: boolean,
): UserDirectoryReadAccessTokenActionRequester {
  return yield {
    type: UserDirectoryActionType.ReadAccessToken,
    payload: {
      userDirectoryName,

      ignoreExpiration,
    },
  };
}
