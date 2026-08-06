import { UserAttributes, UserDirectoryActionType } from './UserDirectoryActionType';

// Payload
export interface UserDirectoryGetUserAttributesByUserIdActionPayload {
  userDirectoryName: string;

  userId: string;
}
