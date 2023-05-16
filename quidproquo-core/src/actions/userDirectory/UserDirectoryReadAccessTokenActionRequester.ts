import { UserDirectoryReadAccessTokenActionRequester } from './UserDirectoryReadAccessTokenActionTypes';
import { UserDirectoryActionType } from './UserDirectoryActionType';

export function* askUserDirectoryReadAccessToken(
  userDirectoryName: string,
  serviceOverride?: string,
): UserDirectoryReadAccessTokenActionRequester {
  return yield {
    type: UserDirectoryActionType.ReadAccessToken,
    payload: {
      userDirectoryName,

      serviceOverride,
    },
  };
}
