import { UserDirectoryActionType } from './UserDirectoryActionType';
import { UserDirectoryGetUserAttributesByUserIdActionRequester } from './UserDirectoryGetUserAttributesByUserIdActionTypes';

export function* askUserDirectoryGetUserAttributesByUserId(
  userDirectoryName: string,
  userId: string,
): UserDirectoryGetUserAttributesByUserIdActionRequester {
  return yield {
    type: UserDirectoryActionType.GetUserAttributesByUserId,
    payload: {
      userDirectoryName,

      userId,
    },
  };
}
