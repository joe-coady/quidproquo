import { UserDirectoryGetUsersActionRequester } from './UserDirectoryGetUsersActionTypes';
import { UserDirectoryActionType } from './UserDirectoryActionType';

export function* askUserDirectoryGetUsers(userDirectoryName: string, nextPageKey?: string): UserDirectoryGetUsersActionRequester {
  return yield {
    type: UserDirectoryActionType.GetUsers,
    payload: {
      userDirectoryName,

      nextPageKey,
    },
  };
}
