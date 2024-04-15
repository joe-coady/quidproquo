import { UserDirectoryGetUserAttributesActionRequester } from './UserDirectoryGetUserAttributesActionTypes';
import { UserDirectoryActionType } from './UserDirectoryActionType';

export function* askUserDirectoryGetUserAttributes(
  userDirectoryName: string,
  username: string,
): UserDirectoryGetUserAttributesActionRequester {
  return yield {
    type: UserDirectoryActionType.GetUserAttributes,
    payload: {
      userDirectoryName,

      username,
    },
  };
}
