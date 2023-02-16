import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { UserDirectoryActionType } from './UserDirectoryActionType';

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
  string
>;
export type UserDirectoryCreateUserActionRequester = ActionRequester<
  UserDirectoryCreateUserAction,
  string
>;
