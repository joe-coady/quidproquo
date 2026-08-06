import { DecodedAccessToken } from '../../types';
import { UserDirectoryActionType } from './UserDirectoryActionType';

// Payload
export interface UserDirectorySetAccessTokenActionPayload {
  accessToken: string;
  userDirectoryName: string;
}
