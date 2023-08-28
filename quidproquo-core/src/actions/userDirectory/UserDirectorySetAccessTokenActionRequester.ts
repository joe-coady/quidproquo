import { UserDirectorySetAccessTokenActionRequester } from './UserDirectorySetAccessTokenActionTypes';
import { UserDirectoryActionType } from './UserDirectoryActionType';

export function* askUserDirectorySetAccessToken(
  accessToken: string
): UserDirectorySetAccessTokenActionRequester {
  return yield {
    type: UserDirectoryActionType.SetAccessToken,
    payload: {
      accessToken,
    },
  };
}
