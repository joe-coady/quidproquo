import { createErrorEnumForAction } from '../../types';
import { UserDirectoryActionType } from './UserDirectoryActionType';
import { UserDirectoryGetUserAttributesByUserIdActionRequester } from './UserDirectoryGetUserAttributesByUserIdActionTypes';

export const UserDirectoryGetUserAttributesByUserIdErrorTypeEnum = createErrorEnumForAction(UserDirectoryActionType.GetUserAttributesByUserId, [
  'UserNotFound', // no user matches the supplied userId (sub)
]);

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
