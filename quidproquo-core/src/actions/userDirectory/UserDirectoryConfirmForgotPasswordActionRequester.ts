import { UserDirectoryConfirmForgotPasswordActionRequester } from './UserDirectoryConfirmForgotPasswordActionTypes';
import { UserDirectoryActionType } from './UserDirectoryActionType';

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
