import { UserAttributes, UserDirectoryActionType } from './UserDirectoryActionType';
import { UserDirectorySetUserAttributesActionRequester } from './UserDirectorySetUserAttributesActionTypes';

export function* askUserDirectorySetUserAttributes(
  userDirectoryName: string,
  username: string,
  userAttributes: UserAttributes,
): UserDirectorySetUserAttributesActionRequester {
  return yield {
    type: UserDirectoryActionType.SetUserAttributes,
    payload: {
      userDirectoryName,

      username,
      userAttributes,
    },
  };
}
