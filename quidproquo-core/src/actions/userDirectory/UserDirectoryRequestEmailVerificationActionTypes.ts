import { AuthenticationDeliveryDetails, UserDirectoryActionType } from './UserDirectoryActionType';

// Payload
export interface UserDirectoryRequestEmailVerificationActionPayload {
  userDirectoryName: string;

  accessToken: string;
}
