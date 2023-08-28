import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { UserDirectoryActionType } from './UserDirectoryActionType';

// Payload
export interface UserDirectorySetAccessTokenActionPayload {
  accessToken: string;
}

// Action
export interface UserDirectorySetAccessTokenAction
  extends Action<UserDirectorySetAccessTokenActionPayload> {
  type: UserDirectoryActionType.SetAccessToken;
  payload: UserDirectorySetAccessTokenActionPayload;
}

// Function Types
export type UserDirectorySetAccessTokenActionProcessor = ActionProcessor<
  UserDirectorySetAccessTokenAction,
  void
>;
export type UserDirectorySetAccessTokenActionRequester = ActionRequester<
  UserDirectorySetAccessTokenAction,
  void
>;
