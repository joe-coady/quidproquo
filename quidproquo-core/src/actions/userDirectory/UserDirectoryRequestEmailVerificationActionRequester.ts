import { UserDirectoryActionType } from './UserDirectoryActionType';
import { UserDirectoryRequestEmailVerificationActionRequester } from './UserDirectoryRequestEmailVerificationActionTypes';

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
