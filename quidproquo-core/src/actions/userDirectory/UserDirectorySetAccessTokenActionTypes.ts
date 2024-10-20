import { DecodedAccessToken } from '../../types';
import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { UserDirectoryActionType } from './UserDirectoryActionType';

// Payload
export interface UserDirectorySetAccessTokenActionPayload {
  accessToken: string;
  userDirectoryName: string;
}

// Action
export interface UserDirectorySetAccessTokenAction extends Action<UserDirectorySetAccessTokenActionPayload> {
  type: UserDirectoryActionType.SetAccessToken;
  payload: UserDirectorySetAccessTokenActionPayload;
}

// Function Types
export type UserDirectorySetAccessTokenActionProcessor = ActionProcessor<UserDirectorySetAccessTokenAction, DecodedAccessToken>;
export type UserDirectorySetAccessTokenActionRequester = ActionRequester<UserDirectorySetAccessTokenAction, DecodedAccessToken>;
