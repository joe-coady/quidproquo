import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { UserDirectoryActionType, AuthenticateUserResponse } from './UserDirectoryActionType';

// Payload
export interface UserDirectoryRefreshTokenActionPayload {
  userDirectoryName: string;

  refreshToken: string;
}

// Action
export interface UserDirectoryRefreshTokenAction
  extends Action<UserDirectoryRefreshTokenActionPayload> {
  type: UserDirectoryActionType.RefreshToken;
  payload: UserDirectoryRefreshTokenActionPayload;
}

// Function Types
export type UserDirectoryRefreshTokenActionProcessor = ActionProcessor<
  UserDirectoryRefreshTokenAction,
  AuthenticateUserResponse
>;
export type UserDirectoryRefreshTokenActionRequester = ActionRequester<
  UserDirectoryRefreshTokenAction,
  AuthenticateUserResponse
>;
