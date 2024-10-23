import { UserDirectoryActionType } from './UserDirectoryActionType';
import { UserDirectoryRefreshTokenActionRequester } from './UserDirectoryRefreshTokenActionTypes';

export function* askUserDirectoryRefreshToken(userDirectoryName: string, refreshToken: string): UserDirectoryRefreshTokenActionRequester {
  return yield {
    type: UserDirectoryActionType.RefreshToken,
    payload: {
      userDirectoryName,

      refreshToken,
    },
  };
}
