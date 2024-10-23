import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { UserAttributes,UserDirectoryActionType } from './UserDirectoryActionType';

// Payload
export interface UserDirectoryGetUserAttributesByUserIdActionPayload {
  userDirectoryName: string;

  userId: string;
}

// Action
export interface UserDirectoryGetUserAttributesByUserIdAction extends Action<UserDirectoryGetUserAttributesByUserIdActionPayload> {
  type: UserDirectoryActionType.GetUserAttributesByUserId;
  payload: UserDirectoryGetUserAttributesByUserIdActionPayload;
}

// Function Types
export type UserDirectoryGetUserAttributesByUserIdActionProcessor = ActionProcessor<UserDirectoryGetUserAttributesByUserIdAction, UserAttributes>;
export type UserDirectoryGetUserAttributesByUserIdActionRequester = ActionRequester<UserDirectoryGetUserAttributesByUserIdAction, UserAttributes>;
