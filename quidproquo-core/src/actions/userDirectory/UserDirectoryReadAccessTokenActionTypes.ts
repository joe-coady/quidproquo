import { DecodedAccessToken } from '../../types';
import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { UserDirectoryActionType } from './UserDirectoryActionType';

// Payload
export interface UserDirectoryReadAccessTokenActionPayload {
  userDirectoryName: string;

  ignoreExpiration: boolean;
}

// Action
export interface UserDirectoryReadAccessTokenAction extends Action<UserDirectoryReadAccessTokenActionPayload> {
  type: UserDirectoryActionType.ReadAccessToken;
  payload: UserDirectoryReadAccessTokenActionPayload;
}

// Function Types
export type UserDirectoryReadAccessTokenActionProcessor = ActionProcessor<UserDirectoryReadAccessTokenAction, DecodedAccessToken>;
export type UserDirectoryReadAccessTokenActionRequester = ActionRequester<UserDirectoryReadAccessTokenAction, DecodedAccessToken>;
