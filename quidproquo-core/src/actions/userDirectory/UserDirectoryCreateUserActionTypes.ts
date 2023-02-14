import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { UserDirectoryActionType } from './UserDirectoryActionType';

// Payload
export interface UserDirectoryCreateUserActionPayload {
  userDirectoryName: string;

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
  string
>;
export type UserDirectoryCreateUserActionRequester = ActionRequester<
  UserDirectoryCreateUserAction,
  string
>;
