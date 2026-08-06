import { DecodedAccessToken } from '../../types';
import { UserDirectoryActionType } from './UserDirectoryActionType';

// Payload
export interface UserDirectoryReadAccessTokenActionPayload {
  userDirectoryName: string;

  ignoreExpiration: boolean;
}
