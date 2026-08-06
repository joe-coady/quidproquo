import { AuthenticateUserResponse, UserDirectoryActionType } from './UserDirectoryActionType';

// Payload
export interface UserDirectoryRefreshTokenActionPayload {
  userDirectoryName: string;

  refreshToken: string;
}
