import { createErrorEnumForAction } from '../../types';
import { UserDirectoryActionType } from './UserDirectoryActionType';
import { UserDirectoryGetUserAttributesActionRequester } from './UserDirectoryGetUserAttributesActionTypes';

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
