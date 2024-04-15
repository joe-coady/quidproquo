import { UserDirectorySetUserAttributesActionRequester } from './UserDirectorySetUserAttributesActionTypes';
import { UserAttributes, UserDirectoryActionType } from './UserDirectoryActionType';

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
