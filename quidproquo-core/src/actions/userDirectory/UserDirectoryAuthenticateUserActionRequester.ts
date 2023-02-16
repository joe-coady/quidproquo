import {
  UserDirectoryAuthenticateUserActionRequester,
  AuthenticateUserRequest,
} from './UserDirectoryAuthenticateUserActionTypes';
import { UserDirectoryActionType } from './UserDirectoryActionType';

export function* askUserDirectoryAuthenticateUser(
  userDirectoryName: string,
  authenticateUserRequest: AuthenticateUserRequest,
): UserDirectoryAuthenticateUserActionRequester {
  return yield {
    type: UserDirectoryActionType.AuthenticateUser,
    payload: {
      userDirectoryName,

      authenticateUserRequest,
    },
  };
}
