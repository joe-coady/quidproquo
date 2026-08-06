import { UserDirectoryActionType } from './UserDirectoryActionType';

// Payload
export interface UserDirectoryChangePasswordActionPayload {
  oldPassword: string;
  newPassword: string;
  accessToken: string;
}
