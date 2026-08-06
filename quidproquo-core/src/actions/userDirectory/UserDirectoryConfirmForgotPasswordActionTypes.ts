import { AuthenticateUserResponse, UserDirectoryActionType } from './UserDirectoryActionType';

// Payload
export interface UserDirectoryConfirmForgotPasswordActionPayload {
  userDirectoryName: string;

  code: string;
  username: string;
  password: string;
}
