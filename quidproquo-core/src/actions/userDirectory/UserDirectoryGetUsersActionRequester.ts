import { createErrorEnumForAction } from '../../types';
import { UserDirectoryActionType } from './UserDirectoryActionType';
import { UserDirectoryGetUsersActionRequester } from './UserDirectoryGetUsersActionTypes';

export const UserDirectoryGetUsersErrorTypeEnum = createErrorEnumForAction(UserDirectoryActionType.GetUsers, [
  'InvalidPageKey', // the supplied nextPageKey is malformed or no longer valid
  'LimitExceeded', // the user directory is throttling requests; the caller should back off and retry later
]);

export function* askUserDirectoryGetUsers(userDirectoryName: string, nextPageKey?: string): UserDirectoryGetUsersActionRequester {
  return yield {
    type: UserDirectoryActionType.GetUsers,
    payload: {
      userDirectoryName,

      nextPageKey,
    },
  };
}
