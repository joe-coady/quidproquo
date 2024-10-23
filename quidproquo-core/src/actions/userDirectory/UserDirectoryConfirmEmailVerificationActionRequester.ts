import { UserDirectoryActionType } from './UserDirectoryActionType';
import { UserDirectoryConfirmEmailVerificationActionRequester } from './UserDirectoryConfirmEmailVerificationActionTypes';

export function* askUserDirectoryConfirmEmailVerification(code: string, accessToken: string): UserDirectoryConfirmEmailVerificationActionRequester {
  return yield {
    type: UserDirectoryActionType.ConfirmEmailVerification,
    payload: {
      code,
      accessToken,
    },
  };
}
