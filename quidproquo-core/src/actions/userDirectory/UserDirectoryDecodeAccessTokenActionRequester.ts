import { UserDirectoryDecodeAccessTokenActionRequester } from './UserDirectoryDecodeAccessTokenActionTypes';
import { UserDirectoryActionType } from './UserDirectoryActionType';

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
