import { UserDirectorySetAccessTokenActionRequester } from './UserDirectorySetAccessTokenActionTypes';
import { UserDirectoryActionType } from './UserDirectoryActionType';

export function* askUserDirectorySetAccessToken(userDirectoryName: string, accessToken: string): UserDirectorySetAccessTokenActionRequester {
  return yield {
    type: UserDirectoryActionType.SetAccessToken,
    payload: {
      accessToken,
      userDirectoryName,
    },
  };
}
