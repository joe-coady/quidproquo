import { UserDirectoryActionType } from './UserDirectoryActionType';
import { UserDirectoryChangePasswordActionRequester } from './UserDirectoryChangePasswordActionTypes';

export function* askUserDirectoryChangePassword(oldPassword: string, newPassword: string): UserDirectoryChangePasswordActionRequester {
  return yield {
    type: UserDirectoryActionType.ChangePassword,
    payload: {
      oldPassword,
      newPassword,
    },
  };
}
