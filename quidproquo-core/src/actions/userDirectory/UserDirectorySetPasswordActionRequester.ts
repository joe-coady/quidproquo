import { UserDirectorySetPasswordActionRequester } from './UserDirectorySetPasswordActionTypes';
import { UserDirectoryActionType } from './UserDirectoryActionType';

export function* askUserDirectorySetPassword(
  userDirectoryName: string,
  username: string,
  newPassword: string,
): UserDirectorySetPasswordActionRequester {
  return yield {
    type: UserDirectoryActionType.SetPassword,
    payload: {
      userDirectoryName,
      username,
      newPassword,
    },
  };
}
