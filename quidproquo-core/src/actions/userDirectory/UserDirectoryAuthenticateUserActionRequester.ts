import { createErrorEnumForAction } from '../../types';
import { askThrowError } from '../error/ErrorThrowErrorActionRequester';
import { AuthenticateUserResponse, UserDirectoryActionType } from './UserDirectoryActionType';
import { AuthenticateUserRequest, UserDirectoryAuthenticateUserActionRequester } from './UserDirectoryAuthenticateUserActionTypes';

export const UserDirectoryAuthenticateUserErrorTypeEnum = createErrorEnumForAction(UserDirectoryActionType.AuthenticateUser, [
  'UserNotFound',
  'InvalidPassword',
]);

export function* askUserDirectoryAuthenticateUser(
  userDirectoryName: string,
  isCustom: boolean,
  email: string,
  password?: string,
): UserDirectoryAuthenticateUserActionRequester {
  // A standard sign-in without a password can never succeed. Fail fast here so a
  // missing password is a typed error rather than an undefined value handed to the
  // identity provider (the dev-server processor would otherwise accept it).
  if (!isCustom && !password) {
    return yield* askThrowError<AuthenticateUserResponse>(UserDirectoryAuthenticateUserErrorTypeEnum.InvalidPassword, 'Password required');
  }

  const authenticateUserRequest: AuthenticateUserRequest = isCustom
    ? {
        isCustom: true,
        email: email,
      }
    : {
        isCustom: false,
        email,
        password: password!,
      };

  return yield {
    type: UserDirectoryActionType.AuthenticateUser,
    payload: {
      userDirectoryName,

      authenticateUserRequest,
    },
  };
}
