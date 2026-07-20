import { createErrorEnumForAction } from '../../types';
import { UserDirectoryActionType } from './UserDirectoryActionType';
import { UserDirectorySignOutUserActionRequester } from './UserDirectorySignOutUserActionTypes';

export const UserDirectorySignOutUserErrorTypeEnum = createErrorEnumForAction(UserDirectoryActionType.SignOutUser, [
  'Unauthorized', // the access token is missing/invalid/expired — there is nothing to revoke
  'LimitExceeded', // too many attempts; the caller should back off and retry later
]);

// Globally signs the user out: revokes EVERY refresh token issued to the owner of this
// access token, so a stolen/persisted refresh token stops working (logout / compromise
// response). Access tokens already minted remain valid until they expire (stateless JWTs),
// so keep the access-token validity short.
export function* askUserDirectorySignOutUser(accessToken: string): UserDirectorySignOutUserActionRequester {
  return yield {
    type: UserDirectoryActionType.SignOutUser,
    payload: {
      accessToken,
    },
  };
}
