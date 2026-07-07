import { createErrorEnumForAction } from '../../types';
import { UserDirectoryActionType } from './UserDirectoryActionType';
import { UserDirectoryRequestEmailVerificationActionRequester } from './UserDirectoryRequestEmailVerificationActionTypes';

export const UserDirectoryRequestEmailVerificationErrorTypeEnum = createErrorEnumForAction(UserDirectoryActionType.RequestEmailVerification, [
  'Unauthorized', // the access token is missing/invalid — the caller must re-authenticate
  'LimitExceeded', // too many verification-code requests; the caller should back off and retry later
  'CodeDeliveryFailed', // the verification code could not be delivered to the user
]);

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
