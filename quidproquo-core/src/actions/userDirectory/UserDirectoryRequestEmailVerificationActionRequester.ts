import { UserDirectoryRequestEmailVerificationActionRequester } from './UserDirectoryRequestEmailVerificationActionTypes';
import { UserDirectoryActionType } from './UserDirectoryActionType';

export function* askUserDirectoryRequestEmailVerification(
  userDirectoryName: string,
  accessToken: string,
): UserDirectoryRequestEmailVerificationActionRequester {
  return yield {
    type: UserDirectoryActionType.RequestEmailVerification,
    payload: {
      userDirectoryName,

      accessToken,
    },
  };
}
