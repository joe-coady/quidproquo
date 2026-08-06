import { createActionRequester } from '../../types';
import { UserDirectoryActionType } from './UserDirectoryActionType';
import { DecodedAccessToken } from '../../types/StorySession';

export const askUserDirectoryReadAccessToken = createActionRequester<DecodedAccessToken>()({
  actionType: UserDirectoryActionType.ReadAccessToken,
  getPayload: (userDirectoryName: string, ignoreExpiration: boolean) => ({ userDirectoryName, ignoreExpiration }),
});
