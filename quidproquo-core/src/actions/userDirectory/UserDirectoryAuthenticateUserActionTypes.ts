import { AuthenticateUserResponse, UserDirectoryActionType } from './UserDirectoryActionType';

export type AuthenticateUserRequest = {
  email: string;
} & (
  | {
      [key: string]: any;
      isCustom: true;
    }
  | {
      password: string;
      isCustom: false;
    }
);

// Payload
export type UserDirectoryAuthenticateUserActionPayload = {
  userDirectoryName: string;
  authenticateUserRequest: AuthenticateUserRequest;
};

// The requester can also yield a ThrowError action: a standard (non custom) sign-in
// with no password is rejected in the requester before it ever reaches a processor.
