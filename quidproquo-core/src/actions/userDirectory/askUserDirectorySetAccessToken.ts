import { createActionRequester } from '../../types';
import { UserDirectoryActionType } from './UserDirectoryActionType';
import { DecodedAccessToken } from '../../types/StorySession';

export const askUserDirectorySetAccessToken = createActionRequester<DecodedAccessToken>()({
  actionType: UserDirectoryActionType.SetAccessToken,
  getPayload: (userDirectoryName: string, accessToken: string) => ({ accessToken, userDirectoryName }),
});
