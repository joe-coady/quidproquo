import { AuthenticationDeliveryDetails, UserDirectoryActionType } from './UserDirectoryActionType';

// Payload
export interface UserDirectoryForgotPasswordActionPayload {
  userDirectoryName: string;

  username: string;
}
