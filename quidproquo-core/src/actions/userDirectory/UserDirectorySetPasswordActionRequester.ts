import { createErrorEnumForAction } from '../../types';
import { UserDirectoryActionType } from './UserDirectoryActionType';
import { UserDirectorySetPasswordActionRequester } from './UserDirectorySetPasswordActionTypes';

export const UserDirectorySetPasswordErrorTypeEnum = createErrorEnumForAction(UserDirectoryActionType.SetPassword, [
  'UserNotFound', // no user matches the supplied username
  'InvalidNewPassword', // the supplied password does not meet the user pool password policy
  'LimitExceeded', // too many attempts; the caller should back off and retry later
]);

export function* askUserDirectorySetPassword(
  userDirectoryName: string,
  username: string,
  newPassword: string,
): UserDirectorySetPasswordActionRequester {
  return yield {
    type: UserDirectoryActionType.SetPassword,
    payload: {
      userDirectoryName,
      username,
      newPassword,
    },
  };
}
