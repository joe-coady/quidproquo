import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { UserDirectoryActionType } from './UserDirectoryActionType';

// Payload
export interface UserDirectoryCreateUserActionPayload {
  email?: string;
  phone?: string;
}

// Action
export interface UserDirectoryCreateUserAction
  extends Action<UserDirectoryCreateUserActionPayload> {
  type: UserDirectoryActionType.CreateUser;
  payload: UserDirectoryCreateUserActionPayload;
}

// Function Types
export type UserDirectoryCreateUserActionProcessor = ActionProcessor<
  UserDirectoryCreateUserAction,
  boolean
>;
export type UserDirectoryCreateUserActionRequester = ActionRequester<
  UserDirectoryCreateUserAction,
  boolean
>;
