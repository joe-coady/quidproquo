import { createErrorEnumForAction } from '../../types';
import { UserDirectoryActionType } from './UserDirectoryActionType';
import { UserDirectoryConfirmForgotPasswordActionRequester } from './UserDirectoryConfirmForgotPasswordActionTypes';

export const UserDirectoryConfirmForgotPasswordErrorTypeEnum = createErrorEnumForAction(UserDirectoryActionType.ConfirmForgotPassword, [
  'InvalidCode', // the supplied confirmation code does not match
  'ExpiredCode', // the confirmation code has expired; the caller should request a new one
  'InvalidNewPassword', // the proposed new password does not meet the user pool password policy
  'LimitExceeded', // too many attempts; the caller should back off and retry later
]);

export function* askUserDirectoryConfirmForgotPassword(
  userDirectoryName: string,
  code: string,
  username: string,
  password: string,
): UserDirectoryConfirmForgotPasswordActionRequester {
  return yield {
    type: UserDirectoryActionType.ConfirmForgotPassword,
    payload: {
      userDirectoryName,

      code,
      username,
      password,
    },
  };
}
