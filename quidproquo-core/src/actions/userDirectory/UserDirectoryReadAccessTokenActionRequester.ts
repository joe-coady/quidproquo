import { UserDirectoryActionType } from './UserDirectoryActionType';
import { UserDirectoryReadAccessTokenActionRequester } from './UserDirectoryReadAccessTokenActionTypes';

export function* askUserDirectoryReadAccessToken(userDirectoryName: string, ignoreExpiration: boolean): UserDirectoryReadAccessTokenActionRequester {
  return yield {
    type: UserDirectoryActionType.ReadAccessToken,
    payload: {
      userDirectoryName,

      ignoreExpiration,
    },
  };
}
