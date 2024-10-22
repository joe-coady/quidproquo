import { UserDirectoryConfirmEmailVerificationActionRequester } from './UserDirectoryConfirmEmailVerificationActionTypes';
import { UserDirectoryActionType } from './UserDirectoryActionType';

export function* askUserDirectoryConfirmEmailVerification(code: string, accessToken: string): UserDirectoryConfirmEmailVerificationActionRequester {
  return yield {
    type: UserDirectoryActionType.ConfirmEmailVerification,
    payload: {
      code,
      accessToken,
    },
  };
}
