import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { UserDirectoryActionType } from './UserDirectoryActionType';

// Payload
export interface UserDirectoryRevokeRefreshTokenActionPayload {
  userDirectoryName: string;

  refreshToken: string;
}

// Action
export interface UserDirectoryRevokeRefreshTokenAction extends Action<UserDirectoryRevokeRefreshTokenActionPayload> {
  type: UserDirectoryActionType.RevokeRefreshToken;
  payload: UserDirectoryRevokeRefreshTokenActionPayload;
}

// Function Types
export type UserDirectoryRevokeRefreshTokenActionProcessor = ActionProcessor<UserDirectoryRevokeRefreshTokenAction, void>;
export type UserDirectoryRevokeRefreshTokenActionRequester = ActionRequester<UserDirectoryRevokeRefreshTokenAction, void>;
