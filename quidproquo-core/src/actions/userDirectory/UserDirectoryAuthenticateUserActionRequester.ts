import { UserDirectoryAuthenticateUserActionRequester, AuthenticateUserRequest } from './UserDirectoryAuthenticateUserActionTypes';
import { UserDirectoryActionType } from './UserDirectoryActionType';
import { createErrorEnumForAction } from '../../types';

export const UserDirectoryAuthenticateUserErrorTypeEnum = createErrorEnumForAction(UserDirectoryActionType.AuthenticateUser, ['UserNotFound']);

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
