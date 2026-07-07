import { createErrorEnumForAction } from '../../types';
import { UserDirectoryActionType } from './UserDirectoryActionType';
import { UserDirectoryChangePasswordActionRequester } from './UserDirectoryChangePasswordActionTypes';

export const UserDirectoryChangePasswordErrorTypeEnum = createErrorEnumForAction(UserDirectoryActionType.ChangePassword, [
  'IncorrectPassword', // the supplied current password was wrong (or the access token was invalid)
  'InvalidNewPassword', // the proposed new password does not meet the user pool password policy
  'LimitExceeded', // too many password-change attempts; the caller should back off and retry later
]);

export function* askUserDirectoryChangePassword(
  oldPassword: string,
  newPassword: string,
  accessToken: string,
): UserDirectoryChangePasswordActionRequester {
  return yield {
    type: UserDirectoryActionType.ChangePassword,
    payload: {
      oldPassword,
      newPassword,
      accessToken,
    },
  };
}
