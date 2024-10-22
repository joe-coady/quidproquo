import { UserDirectoryRefreshTokenActionRequester } from './UserDirectoryRefreshTokenActionTypes';
import { UserDirectoryActionType } from './UserDirectoryActionType';

export function* askUserDirectoryRefreshToken(userDirectoryName: string, refreshToken: string): UserDirectoryRefreshTokenActionRequester {
  return yield {
    type: UserDirectoryActionType.RefreshToken,
    payload: {
      userDirectoryName,

      refreshToken,
    },
  };
}
