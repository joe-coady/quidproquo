import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { UserDirectoryActionType, AuthenticateUserResponse } from './UserDirectoryActionType';

export interface AuthenticateUserRequest {
  email: string;
  password: string;
}

// Payload
export interface UserDirectoryAuthenticateUserActionPayload {
  userDirectoryName: string;

  authenticateUserRequest: AuthenticateUserRequest;
}

// Action
export interface UserDirectoryAuthenticateUserAction
  extends Action<UserDirectoryAuthenticateUserActionPayload> {
  type: UserDirectoryActionType.AuthenticateUser;
  payload: UserDirectoryAuthenticateUserActionPayload;
}

// Function Types
export type UserDirectoryAuthenticateUserActionProcessor = ActionProcessor<
  UserDirectoryAuthenticateUserAction,
  AuthenticateUserResponse
>;
export type UserDirectoryAuthenticateUserActionRequester = ActionRequester<
  UserDirectoryAuthenticateUserAction,
  AuthenticateUserResponse
>;
