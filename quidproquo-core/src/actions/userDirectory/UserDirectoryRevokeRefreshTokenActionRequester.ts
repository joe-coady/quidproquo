import { createErrorEnumForAction } from '../../types';
import { UserDirectoryActionType } from './UserDirectoryActionType';
import { UserDirectoryRevokeRefreshTokenActionRequester } from './UserDirectoryRevokeRefreshTokenActionTypes';

export const UserDirectoryRevokeRefreshTokenErrorTypeEnum = createErrorEnumForAction(UserDirectoryActionType.RevokeRefreshToken, [
  'Unauthorized', // the refresh token is invalid/already revoked, or revocation is disabled on the app client
  'LimitExceeded', // too many attempts; the caller should back off and retry later
]);

// Revokes a SINGLE refresh token (and every access token minted from it) — the "log out
// this device" primitive. Unlike SignOutUser (which revokes all of a user's sessions), this
// targets exactly the session that holds this refresh token, so other devices stay signed in.
export function* askUserDirectoryRevokeRefreshToken(userDirectoryName: string, refreshToken: string): UserDirectoryRevokeRefreshTokenActionRequester {
  return yield {
    type: UserDirectoryActionType.RevokeRefreshToken,
    payload: {
      userDirectoryName,

      refreshToken,
    },
  };
}
