import { UserAttributes, UserDirectoryActionType } from './UserDirectoryActionType';

// Payload
export interface UserDirectoryGetUserAttributesActionPayload {
  userDirectoryName: string;

  username: string;
}
