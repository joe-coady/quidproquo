import { UserDirectoryActionType } from './UserDirectoryActionType';

// Payload
export interface UserDirectoryConfirmEmailVerificationActionPayload {
  code: string;
  accessToken: string;
}
