import { UserDirectoryActionType } from './UserDirectoryActionType';
import { UserDirectoryDecodeAccessTokenActionRequester } from './UserDirectoryDecodeAccessTokenActionTypes';

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
