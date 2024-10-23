import { UserDirectoryActionType } from './UserDirectoryActionType';
import { UserDirectorySetAccessTokenActionRequester } from './UserDirectorySetAccessTokenActionTypes';

export function* askUserDirectorySetAccessToken(userDirectoryName: string, accessToken: string): UserDirectorySetAccessTokenActionRequester {
  return yield {
    type: UserDirectoryActionType.SetAccessToken,
    payload: {
      accessToken,
      userDirectoryName,
    },
  };
}
