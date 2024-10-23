import { UserDirectoryActionType } from './UserDirectoryActionType';
import { UserDirectorySetPasswordActionRequester } from './UserDirectorySetPasswordActionTypes';

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
