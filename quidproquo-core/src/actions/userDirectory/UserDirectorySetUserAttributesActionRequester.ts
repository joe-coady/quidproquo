import { createErrorEnumForAction } from '../../types';
import { UserAttributes, UserDirectoryActionType } from './UserDirectoryActionType';
import { UserDirectorySetUserAttributesActionRequester } from './UserDirectorySetUserAttributesActionTypes';

export const UserDirectorySetUserAttributesErrorTypeEnum = createErrorEnumForAction(UserDirectoryActionType.SetUserAttributes, [
  'UserNotFound', // no user matches the supplied username
  'InvalidAttributes', // one or more supplied attribute names/values are invalid
  'AliasExists', // an email/phone attribute value is already in use by another account
  'LimitExceeded', // too many attempts; the caller should back off and retry later
]);

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
