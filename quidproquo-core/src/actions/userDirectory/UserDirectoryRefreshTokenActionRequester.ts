import { createErrorEnumForAction } from '../../types';
import { UserDirectoryActionType } from './UserDirectoryActionType';
import { UserDirectoryRefreshTokenActionRequester } from './UserDirectoryRefreshTokenActionTypes';

export const UserDirectoryRefreshTokenErrorTypeEnum = createErrorEnumForAction(UserDirectoryActionType.RefreshToken, [
  'Unauthorized', // the access token is missing/invalid, or the refresh token was rejected (expired/revoked) — the caller must re-authenticate
  'LimitExceeded', // too many refresh attempts; the caller should back off and retry later
]);

export function* askUserDirectoryRefreshToken(userDirectoryName: string, refreshToken: string): UserDirectoryRefreshTokenActionRequester {
  return yield {
    type: UserDirectoryActionType.RefreshToken,
    payload: {
      userDirectoryName,

      refreshToken,
    },
  };
}
