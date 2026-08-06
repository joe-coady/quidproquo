import { AuthenticateUserResponse, UserAttributes, UserDirectoryActionType } from './UserDirectoryActionType';

export interface CreateUserRequest extends Omit<UserAttributes, 'userId'> {
  email: string;
  emailVerified: boolean;
  password: string;
}

// Payload
export interface UserDirectoryCreateUserActionPayload {
  userDirectoryName: string;

  createUserRequest: CreateUserRequest;
}
