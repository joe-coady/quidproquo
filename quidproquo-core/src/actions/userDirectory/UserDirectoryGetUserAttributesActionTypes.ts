import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { UserAttributes,UserDirectoryActionType } from './UserDirectoryActionType';

// Payload
export interface UserDirectoryGetUserAttributesActionPayload {
  userDirectoryName: string;

  username: string;
}

// Action
export interface UserDirectoryGetUserAttributesAction extends Action<UserDirectoryGetUserAttributesActionPayload> {
  type: UserDirectoryActionType.GetUserAttributes;
  payload: UserDirectoryGetUserAttributesActionPayload;
}

// Function Types
export type UserDirectoryGetUserAttributesActionProcessor = ActionProcessor<UserDirectoryGetUserAttributesAction, UserAttributes>;
export type UserDirectoryGetUserAttributesActionRequester = ActionRequester<UserDirectoryGetUserAttributesAction, UserAttributes>;
