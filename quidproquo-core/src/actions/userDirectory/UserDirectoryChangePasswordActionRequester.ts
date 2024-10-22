import { UserDirectoryChangePasswordActionRequester } from './UserDirectoryChangePasswordActionTypes';
import { UserDirectoryActionType } from './UserDirectoryActionType';

export function* askUserDirectoryChangePassword(oldPassword: string, newPassword: string): UserDirectoryChangePasswordActionRequester {
  return yield {
    type: UserDirectoryActionType.ChangePassword,
    payload: {
      oldPassword,
      newPassword,
    },
  };
}
