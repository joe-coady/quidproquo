import { UserDirectoryActionType } from './UserDirectoryActionType';
import { UserDirectoryForgotPasswordActionRequester } from './UserDirectoryForgotPasswordActionTypes';

export function* askUserDirectoryForgotPassword(userDirectoryName: string, username: string): UserDirectoryForgotPasswordActionRequester {
  return yield {
    type: UserDirectoryActionType.ForgotPassword,
    payload: {
      userDirectoryName,
      username,
    },
  };
}
