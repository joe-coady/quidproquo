import { UserDirectoryGetUserAttributesByUserIdActionRequester } from './UserDirectoryGetUserAttributesByUserIdActionTypes';
import { UserDirectoryActionType } from './UserDirectoryActionType';

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
