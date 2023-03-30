import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { UserDirectoryActionType, AuthenticateUserResponse } from './UserDirectoryActionType';

export interface CreateUserRequest {
  email: string;
  password: string;

  phone?: string;
}

// Payload
export interface UserDirectoryCreateUserActionPayload {
  userDirectoryName: string;

  createUserRequest: CreateUserRequest;
}

// Action
export interface UserDirectoryCreateUserAction
  extends Action<UserDirectoryCreateUserActionPayload> {
  type: UserDirectoryActionType.CreateUser;
  payload: UserDirectoryCreateUserActionPayload;
}

// Function Types
export type UserDirectoryCreateUserActionProcessor = ActionProcessor<
  UserDirectoryCreateUserAction,
  AuthenticateUserResponse
>;
export type UserDirectoryCreateUserActionRequester = ActionRequester<
  UserDirectoryCreateUserAction,
  AuthenticateUserResponse
>;
