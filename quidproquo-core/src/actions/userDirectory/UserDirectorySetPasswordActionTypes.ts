import { UserDirectoryActionType } from './UserDirectoryActionType';

// Payload
export interface UserDirectorySetPasswordActionPayload {
  userDirectoryName: string;
  username: string;
  newPassword: string;
}
