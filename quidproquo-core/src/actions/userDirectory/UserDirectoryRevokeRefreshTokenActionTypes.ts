import { UserDirectoryActionType } from './UserDirectoryActionType';

// Payload
export interface UserDirectoryRevokeRefreshTokenActionPayload {
  userDirectoryName: string;

  refreshToken: string;
}
