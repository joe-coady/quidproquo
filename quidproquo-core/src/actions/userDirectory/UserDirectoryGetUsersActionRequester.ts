import { UserDirectoryActionType } from './UserDirectoryActionType';
import { UserDirectoryGetUsersActionRequester } from './UserDirectoryGetUsersActionTypes';

export function* askUserDirectoryGetUsers(userDirectoryName: string, nextPageKey?: string): UserDirectoryGetUsersActionRequester {
  return yield {
    type: UserDirectoryActionType.GetUsers,
    payload: {
      userDirectoryName,

      nextPageKey,
    },
  };
}
