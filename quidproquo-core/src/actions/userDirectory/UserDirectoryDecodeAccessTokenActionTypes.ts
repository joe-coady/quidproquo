import { DecodedAccessToken } from '../../types';
import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { UserDirectoryActionType } from './UserDirectoryActionType';

// Payload
export interface UserDirectoryDecodeAccessTokenActionPayload {
  userDirectoryName: string;

  ignoreExpiration: boolean;

  accessToken: string;
}

// Action
export interface UserDirectoryDecodeAccessTokenAction extends Action<UserDirectoryDecodeAccessTokenActionPayload> {
  type: UserDirectoryActionType.DecodeAccessToken;
  payload: UserDirectoryDecodeAccessTokenActionPayload;
}

// Function Types
export type UserDirectoryDecodeAccessTokenActionProcessor = ActionProcessor<UserDirectoryDecodeAccessTokenAction, DecodedAccessToken>;
export type UserDirectoryDecodeAccessTokenActionRequester = ActionRequester<UserDirectoryDecodeAccessTokenAction, DecodedAccessToken>;
