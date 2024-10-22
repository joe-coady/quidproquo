import { UserDirectoryGetUserAttributesActionRequester } from './UserDirectoryGetUserAttributesActionTypes';
import { UserDirectoryActionType } from './UserDirectoryActionType';
import { createErrorEnumForAction } from '../../types';

export const UserDirectoryGetUserAttributesErrorTypeEnum = createErrorEnumForAction(UserDirectoryActionType.GetUserAttributes, ['UserNotFound']);

export function* askUserDirectoryGetUserAttributes(userDirectoryName: string, username: string): UserDirectoryGetUserAttributesActionRequester {
  return yield {
    type: UserDirectoryActionType.GetUserAttributes,
    payload: {
      userDirectoryName,

      username,
    },
  };
}
