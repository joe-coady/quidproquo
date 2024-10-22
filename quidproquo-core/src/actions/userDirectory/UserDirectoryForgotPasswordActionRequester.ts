import { UserDirectoryForgotPasswordActionRequester } from './UserDirectoryForgotPasswordActionTypes';
import { UserDirectoryActionType } from './UserDirectoryActionType';

export function* askUserDirectoryForgotPassword(userDirectoryName: string, username: string): UserDirectoryForgotPasswordActionRequester {
  return yield {
    type: UserDirectoryActionType.ForgotPassword,
    payload: {
      userDirectoryName,
      username,
    },
  };
}
