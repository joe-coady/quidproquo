import { createErrorEnumForAction } from '../../types';
import { UserDirectoryActionType } from './UserDirectoryActionType';
import { UserDirectoryConfirmEmailVerificationActionRequester } from './UserDirectoryConfirmEmailVerificationActionTypes';

export const UserDirectoryConfirmEmailVerificationErrorTypeEnum = createErrorEnumForAction(UserDirectoryActionType.ConfirmEmailVerification, [
  'InvalidCode', // the supplied verification code does not match
  'ExpiredCode', // the verification code has expired; the caller should request a new one
  'LimitExceeded', // too many verification attempts; the caller should back off and retry later
]);

export function* askUserDirectoryConfirmEmailVerification(code: string, accessToken: string): UserDirectoryConfirmEmailVerificationActionRequester {
  return yield {
    type: UserDirectoryActionType.ConfirmEmailVerification,
    payload: {
      code,
      accessToken,
    },
  };
}
