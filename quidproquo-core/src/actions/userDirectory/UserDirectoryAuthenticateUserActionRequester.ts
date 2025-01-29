import { createErrorEnumForAction } from '../../types';
import { UserDirectoryActionType } from './UserDirectoryActionType';
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
  // if (!isCustom && !password) {
  //   return yield* askThrowError(UserDirectoryAuthenticateUserErrorTypeEnum.InvalidPassword, 'Password required');
  // }

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
