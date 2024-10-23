import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { UserAttributes,UserDirectoryActionType } from './UserDirectoryActionType';

// Payload
export interface UserDirectorySetUserAttributesActionPayload {
  userDirectoryName: string;

  username: string;
  userAttributes: UserAttributes;
}

// Action
export interface UserDirectorySetUserAttributesAction extends Action<UserDirectorySetUserAttributesActionPayload> {
  type: UserDirectoryActionType.SetUserAttributes;
  payload: UserDirectorySetUserAttributesActionPayload;
}

// Function Types
export type UserDirectorySetUserAttributesActionProcessor = ActionProcessor<UserDirectorySetUserAttributesAction, void>;
export type UserDirectorySetUserAttributesActionRequester = ActionRequester<UserDirectorySetUserAttributesAction, void>;
