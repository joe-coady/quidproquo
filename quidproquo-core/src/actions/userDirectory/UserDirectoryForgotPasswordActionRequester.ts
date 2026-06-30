import { createErrorEnumForAction } from '../../types';
import { UserDirectoryActionType } from './UserDirectoryActionType';
import { UserDirectoryForgotPasswordActionRequester } from './UserDirectoryForgotPasswordActionTypes';

export const UserDirectoryForgotPasswordErrorTypeEnum = createErrorEnumForAction(UserDirectoryActionType.ForgotPassword, [
  'UserNotFound', // no user matches the supplied username
  'LimitExceeded', // too many forgot-password attempts; the caller should back off and retry later
]);

export function* askUserDirectoryForgotPassword(userDirectoryName: string, username: string): UserDirectoryForgotPasswordActionRequester {
  return yield {
    type: UserDirectoryActionType.ForgotPassword,
    payload: {
      userDirectoryName,
      username,
    },
  };
}
