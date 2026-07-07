import { createErrorEnumForAction } from '../../types';
import { UserDirectoryActionType } from './UserDirectoryActionType';
import { UserDirectoryDecodeAccessTokenActionRequester } from './UserDirectoryDecodeAccessTokenActionTypes';

export const UserDirectoryDecodeAccessTokenErrorTypeEnum = createErrorEnumForAction(UserDirectoryActionType.DecodeAccessToken, [
  'Unauthorized', // the access token is missing, malformed, expired, or its signature could not be verified
]);

export function* askUserDirectoryDecodeAccessToken(
  userDirectoryName: string,
  ignoreExpiration: boolean,
  accessToken: string,
): UserDirectoryDecodeAccessTokenActionRequester {
  return yield {
    type: UserDirectoryActionType.DecodeAccessToken,
    payload: {
      userDirectoryName,

      accessToken,

      ignoreExpiration,
    },
  };
}
