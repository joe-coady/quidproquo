import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { AuthenticateUserResponse, UserAttributes,UserDirectoryActionType } from './UserDirectoryActionType';

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

// Action
export interface UserDirectoryCreateUserAction extends Action<UserDirectoryCreateUserActionPayload> {
  type: UserDirectoryActionType.CreateUser;
  payload: UserDirectoryCreateUserActionPayload;
}

// Function Types
export type UserDirectoryCreateUserActionProcessor = ActionProcessor<UserDirectoryCreateUserAction, AuthenticateUserResponse>;
export type UserDirectoryCreateUserActionRequester = ActionRequester<UserDirectoryCreateUserAction, AuthenticateUserResponse>;
