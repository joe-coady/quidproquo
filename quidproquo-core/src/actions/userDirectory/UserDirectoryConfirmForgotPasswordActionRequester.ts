import { UserDirectoryActionType } from './UserDirectoryActionType';
import { UserDirectoryConfirmForgotPasswordActionRequester } from './UserDirectoryConfirmForgotPasswordActionTypes';

export function* askUserDirectoryConfirmForgotPassword(
  userDirectoryName: string,
  code: string,
  username: string,
  password: string,
): UserDirectoryConfirmForgotPasswordActionRequester {
  return yield {
    type: UserDirectoryActionType.ConfirmForgotPassword,
    payload: {
      userDirectoryName,

      code,
      username,
      password,
    },
  };
}
