import { UserAttributes, UserDirectoryActionType } from './UserDirectoryActionType';

// Payload
export interface UserDirectorySetUserAttributesActionPayload {
  userDirectoryName: string;

  username: string;
  userAttributes: UserAttributes;
}
