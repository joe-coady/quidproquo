import { createErrorEnumForAction } from '../../types';
import { UserAttributes, UserDirectoryActionType } from './UserDirectoryActionType';
import { UserDirectoryGetUsersByAttributeActionRequester } from './UserDirectoryGetUsersByAttributeActionTypes';

export const UserDirectoryGetUsersByAttributeErrorTypeEnum = createErrorEnumForAction(UserDirectoryActionType.GetUsersByAttribute, [
  'InvalidSearchParameters', // the attribute name/value, limit, or page key is invalid or the attribute is not searchable
  'LimitExceeded', // the user directory is throttling requests; the caller should back off and retry later
]);

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
