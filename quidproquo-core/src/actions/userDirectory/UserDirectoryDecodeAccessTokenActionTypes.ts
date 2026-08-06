import { DecodedAccessToken } from '../../types';
import { UserDirectoryActionType } from './UserDirectoryActionType';

// Payload
export interface UserDirectoryDecodeAccessTokenActionPayload {
  userDirectoryName: string;

  ignoreExpiration: boolean;

  accessToken: string;
}
