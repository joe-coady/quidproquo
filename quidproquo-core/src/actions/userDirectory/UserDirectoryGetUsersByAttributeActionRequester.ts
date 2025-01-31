import { UserAttributes, UserDirectoryActionType } from './UserDirectoryActionType';
import { UserDirectoryGetUsersByAttributeActionRequester } from './UserDirectoryGetUsersByAttributeActionTypes';

export function* askUserDirectoryGetUsersByAttribute(
  userDirectoryName: string,
  attribueName: keyof UserAttributes,
  attribueValue: string,
  limit?: number,
  nextPageKey?: string,
): UserDirectoryGetUsersByAttributeActionRequester {
  return yield {
    type: UserDirectoryActionType.GetUsersByAttribute,
    payload: {
      userDirectoryName,

      attribueName,
      attribueValue,
      limit,

      nextPageKey,
    },
  };
}
